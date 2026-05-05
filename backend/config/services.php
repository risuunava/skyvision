<?php

return [

    'bmkg' => [
        'url'     => env('BMKG_API_URL', 'https://api.bmkg.go.id/publik/prakiraan-cuaca'),
        'timeout' => 30,
        'retry'   => 3,
    ],

    'ml' => [
        'url'     => env('ML_SERVICE_URL', 'http://127.0.0.1:5000'),
        'timeout' => 60,
        'enabled' => env('ML_SERVICE_ENABLED', true),
    ],

    'fcm' => [
        'server_key' => env('FCM_SERVER_KEY'),
        'project_id' => env('FCM_PROJECT_ID', 'skyvision-local'),
    ],

];