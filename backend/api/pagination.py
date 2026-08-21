from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class EnvelopePagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"

    def get_paginated_response(self, data):
        return Response({
            "data": data,
            "page": self.page.number,
            "page_size": self.page.paginator.per_page,
            "total": self.page.paginator.count,
        })
