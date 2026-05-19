from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from users.views import CustomTokenObtainPairView

# 1. IMPORT the JWT views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),

    #path('api/users/login/', CustomTokenObtainPairView.as_view(), name='core_token_login'),

    # 2. ADD the authentication routes
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),



    # Your existing apps
    path('api/', include('market.urls')), 
    path('api/products/', include('products.urls')),
    path('api/users/', include('users.urls')),
    path('api/market/', include('market.urls')),
] 

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)