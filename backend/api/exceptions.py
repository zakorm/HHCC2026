from rest_framework.views import exception_handler


def envelope_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return None

    detail = response.data
    if isinstance(detail, dict) and "detail" in detail:
        message = str(detail["detail"])
        details = {}
    else:
        message = "Request failed."
        details = detail if isinstance(detail, dict) else {"errors": detail}

    response.data = {
        "error": {
            "code": exc.__class__.__name__,
            "message": message,
            "details": details,
        }
    }
    return response


def error_response(code, message, status_code, details=None):
    from rest_framework.response import Response

    return Response(
        {"error": {"code": code, "message": message, "details": details or {}}},
        status=status_code,
    )
