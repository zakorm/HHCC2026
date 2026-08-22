"""
PDF-to-Markdown OCR pipeline.

Converts each page of a PDF to an image (pdf2image + poppler) and runs it
through an open-source OCR model (GOT-OCR2.0 by default), then stitches the
per-page text into one Markdown document. Exposed via OcrPdfView
(POST /ocr/pdf in api/views.py + api/urls.py).

Heavy ML deps (torch/transformers/pdf2image) live in requirements-ocr.txt,
not requirements.txt -- install that separately to use this module. The
model is loaded lazily and cached at module level so it's only paid for once
per process, not once per request.

`run_ocr()` is the swap point if a different OCR model/provider is wired in
later -- everything else in the pipeline only depends on its (image path,
mode) -> text signature.
"""

import contextlib
import logging
import tempfile
from pathlib import Path

logger = logging.getLogger(__name__)

DEFAULT_DPI = 200
OCR_MODES = ("format", "ocr")
DEFAULT_MODE = "format"
MODEL_NAME = "stepfun-ai/GOT-OCR2_0"
IMAGE_EXTENSIONS = (".png", ".jpg", ".jpeg")

_model = None
_tokenizer = None
_device = None


class OcrPipelineError(Exception):
    """Pipeline-level failure: missing poppler, unreadable PDF, bad mode, etc."""


def pdf_to_images(pdf_path, dpi=DEFAULT_DPI, output_dir=None):
    """Render each page of `pdf_path` to a PNG in `output_dir`, return the paths in page order."""
    from pdf2image import convert_from_path
    from pdf2image.exceptions import PDFInfoNotInstalledError, PDFPageCountError, PDFSyntaxError

    try:
        return convert_from_path(
            str(pdf_path),
            dpi=dpi,
            output_folder=str(output_dir),
            paths_only=True,
            fmt="png",
        )
    except PDFInfoNotInstalledError as exc:
        raise OcrPipelineError(
            "poppler is not installed (required by pdf2image) -- install it with "
            "`brew install poppler` (macOS) or `apt install poppler-utils` (Linux)."
        ) from exc
    except (PDFPageCountError, PDFSyntaxError) as exc:
        raise OcrPipelineError(f"Could not read PDF: {exc}") from exc


def _load_model():
    global _model, _tokenizer, _device
    if _model is not None:
        return _model, _tokenizer, _device

    import torch
    from transformers import AutoModel, AutoTokenizer

    _device = "cuda" if torch.cuda.is_available() else "cpu"
    if _device == "cpu":
        logger.warning("GOT-OCR2.0: no GPU detected, running on CPU -- inference will be slow.")

    _tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
    _model = AutoModel.from_pretrained(
        MODEL_NAME,
        trust_remote_code=True,
        low_cpu_mem_usage=True,
        use_safetensors=True,
    ).eval()
    _model = _model.to(_device)
    return _model, _tokenizer, _device


@contextlib.contextmanager
def _patched_for_non_cuda(device):
    """
    GOT-OCR2.0's chat() hardcodes .cuda(), .half(), and
    torch.autocast("cuda", ...) regardless of where the model actually
    lives, so it raises `AssertionError: Torch not compiled with CUDA
    enabled` on any non-CUDA machine (every Mac -- macOS has no CUDA
    support at all). Redirect those calls to the real device for the
    duration of one OCR call rather than patching the cached model file.
    """
    import torch

    if device == "cuda":
        yield
        return

    original_cuda = torch.Tensor.cuda
    original_half = torch.Tensor.half
    original_autocast = torch.autocast

    def _cuda(self, *args, **kwargs):
        return self.to(device)

    def _half(self, *args, **kwargs):
        return self

    def _autocast(device_type, *args, **kwargs):
        if device_type == "cuda":
            device_type = device
        return original_autocast(device_type, *args, **kwargs)

    torch.Tensor.cuda = _cuda
    torch.Tensor.half = _half
    torch.autocast = _autocast
    try:
        yield
    finally:
        torch.Tensor.cuda = original_cuda
        torch.Tensor.half = original_half
        torch.autocast = original_autocast


def run_ocr(image_path, mode=DEFAULT_MODE):
    """OCR a single page image. This is the interface to swap for a different model later."""
    model, tokenizer, device = _load_model()
    with _patched_for_non_cuda(device):
        return model.chat(tokenizer, str(image_path), ocr_type=mode)


def assemble_markdown(pages):
    """Stitch per-page OCR text into one Markdown doc with page-break markers."""
    sections = [f"<!-- page {number} -->\n\n{text or ''}".rstrip() for number, text in enumerate(pages, start=1)]
    return "\n\n".join(sections) + "\n"


def process_image(image_path, mode=DEFAULT_MODE):
    """
    Run the pipeline on a single already-rendered image (PNG/JPG) -- no PDF
    conversion step. Returns (markdown_text, failed_pages) for the same
    shape as process_pdf(), with at most one entry in failed_pages.
    """
    if mode not in OCR_MODES:
        raise OcrPipelineError(f"mode must be one of {OCR_MODES}, got {mode!r}")

    failed_pages = []
    try:
        text = run_ocr(image_path, mode=mode)
    except Exception:
        logger.exception("OCR failed on %s", image_path)
        failed_pages = [1]
        text = "*(OCR failed on this page)*"

    return assemble_markdown([text]), failed_pages


def process_pdf(pdf_path, dpi=DEFAULT_DPI, mode=DEFAULT_MODE, progress_cb=None):
    """
    Run the full PDF -> Markdown pipeline.

    Returns (markdown_text, failed_pages). A page that fails OCR is logged
    and replaced with a placeholder rather than aborting the whole run.
    """
    if mode not in OCR_MODES:
        raise OcrPipelineError(f"mode must be one of {OCR_MODES}, got {mode!r}")

    with tempfile.TemporaryDirectory(prefix="ocr_pages_") as tmp_dir:
        image_paths = pdf_to_images(pdf_path, dpi=dpi, output_dir=Path(tmp_dir))
        if not image_paths:
            raise OcrPipelineError("PDF has no pages or could not be rendered.")

        total = len(image_paths)
        pages = []
        failed_pages = []
        for page_number, image_path in enumerate(image_paths, start=1):
            if progress_cb:
                progress_cb(page_number, total)
            else:
                logger.info("Processing page %d/%d...", page_number, total)
            try:
                pages.append(run_ocr(image_path, mode=mode))
            except Exception:
                logger.exception("OCR failed on page %d/%d", page_number, total)
                failed_pages.append(page_number)
                pages.append("*(OCR failed on this page)*")

        return assemble_markdown(pages), failed_pages
