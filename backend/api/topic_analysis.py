"""
Topic-level strength/weakness classification from OCR'd text.

Takes the Markdown text produced by ocr_pipeline.process_pdf()/process_image()
plus a set of candidate curriculum Topics (curriculum.models.Topic) and asks a
small local instruct LLM to sort them into "strong" vs "needs_improvement"
based on whatever signal it can read out of the text (marks, corrections,
grades, or its own judgement of answer correctness).

Chained onto OcrPdfView (api/views.py) when the request includes a unit_id.
Same lazy-load-once, requirements-ocr.txt pattern as ocr_pipeline.py -- and
deliberately the same transformers pin (Qwen2.5's architecture has been
supported since transformers 4.37, so this doesn't need a second pin).
"""

import json
import logging

logger = logging.getLogger(__name__)

MODEL_NAME = "Qwen/Qwen2.5-1.5B-Instruct"

_model = None
_tokenizer = None
_device = None


class TopicAnalysisError(Exception):
    """Raised when the classification model fails or returns unusable output."""


def _load_model():
    global _model, _tokenizer, _device
    if _model is not None:
        return _model, _tokenizer, _device

    import torch
    from transformers import AutoModelForCausalLM, AutoTokenizer

    _device = "cuda" if torch.cuda.is_available() else "cpu"
    if _device == "cpu":
        logger.warning("%s: no GPU detected, running on CPU -- inference will be slow.", MODEL_NAME)

    _tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    _model = AutoModelForCausalLM.from_pretrained(MODEL_NAME, torch_dtype="auto").to(_device).eval()
    return _model, _tokenizer, _device


def _build_prompt(text, topic_names):
    topic_list = "\n".join(f"- {name}" for name in topic_names)
    return (
        "You are reviewing a scanned student paper that has already been OCR'd to text below. "
        "Based on the visible answers, marks, corrections, or grades in the text, classify each "
        "of the following topics as either \"strong\" (student did well) or \"needs_improvement\" "
        "(student struggled). Only use topics from this exact list, and only include a topic if "
        "the text actually gives you a signal about it -- omit topics the text doesn't address.\n\n"
        f"Topics:\n{topic_list}\n\n"
        f"OCR'd paper text:\n\"\"\"\n{text}\n\"\"\"\n\n"
        "Respond with ONLY a JSON object of this exact shape, no other text:\n"
        '{"strong": ["Topic A"], "needs_improvement": ["Topic B"]}'
    )


def _parse_response(raw):
    start = raw.find("{")
    end = raw.rfind("}")
    if start == -1 or end == -1:
        raise TopicAnalysisError(f"Model did not return JSON: {raw[:200]!r}")
    try:
        return json.loads(raw[start:end + 1])
    except json.JSONDecodeError as exc:
        raise TopicAnalysisError(f"Model returned invalid JSON: {exc}") from exc


def analyze_topics(text, topics):
    """
    `topics` is an iterable of curriculum.models.Topic. Returns
    {"strong": [Topic, ...], "needs_improvement": [Topic, ...]} using the
    actual Topic objects (not just names) so callers can use their ids.
    """
    topics = list(topics)
    by_name = {topic.name: topic for topic in topics}
    if not by_name:
        raise TopicAnalysisError("No candidate topics to classify against.")

    model, tokenizer, device = _load_model()
    prompt = _build_prompt(text, by_name.keys())
    messages = [{"role": "user", "content": prompt}]
    input_ids = tokenizer.apply_chat_template(
        messages, add_generation_prompt=True, return_tensors="pt"
    ).to(device)

    output_ids = model.generate(
        input_ids, max_new_tokens=512, do_sample=False, pad_token_id=tokenizer.eos_token_id
    )
    generated_ids = output_ids[0][input_ids.shape[1]:]
    raw = tokenizer.decode(generated_ids, skip_special_tokens=True).strip()

    parsed = _parse_response(raw)

    def _resolve(names):
        return [by_name[name] for name in names if name in by_name]

    return {
        "strong": _resolve(parsed.get("strong", [])),
        "needs_improvement": _resolve(parsed.get("needs_improvement", [])),
    }
