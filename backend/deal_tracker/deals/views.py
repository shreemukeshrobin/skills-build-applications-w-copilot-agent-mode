from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from .models import Deal
from .serializers import DealSerializer

class DealViewSet(viewsets.ModelViewSet):
    queryset = Deal.objects.all()
    serializer_class = DealSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'assigned_to_user_id']
