from django.urls import path
from .views import signup, login, session_user

urlpatterns = [
    path('signup/', signup, name='signup'),
    path('login/', login, name='login'),
    path('session/', session_user, name='session'),
]