from django.urls import path, include
from rest_framework import routers
from .views import LogViewSet, login

router = routers.DefaultRouter()
router.register('log', LogViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('chatbot-user/', login),
]