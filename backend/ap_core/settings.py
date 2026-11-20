"""
Django Settings for Accounts Payable Automation Software
Target: Templegate Technologies & Services Pvt. Ltd.
Author: Abhishek Gadavi
"""

import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env file from project root
load_dotenv(BASE_DIR.parent / '.env')
load_dotenv(BASE_DIR / '.env')

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'django-insecure-templegate-ap-master-key-2026-super-secure')
DEBUG = os.environ.get('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third Party Packages
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',

    # Internal Business Modules
    'apps.accounts',
    'apps.vendors',
    'apps.invoices',
    'apps.matching',
    'apps.approvals',
    'apps.payments',
    'apps.notifications',
    'apps.analytics',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'ap_core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'ap_core.wsgi.application'

# ==============================================================================
# DATABASE CONFIGURATION: PostgreSQL (Mandatory)
# ==============================================================================
# Runs against Docker PostgreSQL service (accounts_payable_db / accounts_user)
# Automated fallback to SQLite only when explicitly enabled for unit tests
USE_POSTGRES = os.environ.get('USE_POSTGRES', 'True') == 'True'

if USE_POSTGRES:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ.get('POSTGRES_DB', 'accounts_payable_db'),
            'USER': os.environ.get('POSTGRES_USER', 'accounts_user'),
            'PASSWORD': os.environ.get('POSTGRES_PASSWORD', 'accounts_secure_pwd_2026'),
            'HOST': os.environ.get('DB_HOST', 'localhost'),
            'PORT': os.environ.get('DB_PORT', '5432'),
            'CONN_MAX_AGE': 60,
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# ==============================================================================
# REST FRAMEWORK & JWT AUTHENTICATION
# ==============================================================================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50,
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=int(os.environ.get('JWT_ACCESS_LIFETIME_MINUTES', 60))),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=int(os.environ.get('JWT_REFRESH_LIFETIME_DAYS', 7))),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'SIGNING_KEY': os.environ.get('JWT_SECRET_KEY', SECRET_KEY),
}

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# OCR & Business Engine Configurations
OCR_CONFIDENCE_THRESHOLD = float(os.environ.get('OCR_CONFIDENCE_THRESHOLD', 85.0))
PRICE_TOLERANCE_PERCENT = float(os.environ.get('PRICE_TOLERANCE_PERCENT', 2.0))
COMPANY_GSTIN = '29TEMP9876E1Z2'
COMPANY_STATE_CODE = '29'  # Karnataka
