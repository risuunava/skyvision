<?php

return [
    // ... existing config ...

    'bmkg' => [
        'url' => env('BMKG_API_URL', 'https://api.bmkg.go.id/publik/prakiraan-cuaca'),
        'timeout' => 30,
        'retry' => 3,
    ],

    'ml' => [
        'url' => env('ML_SERVICE_URL', 'http://127.0.0.1:8001'),
        'timeout' => 60,
    ],

    'fcm' => [
        'server_key' => env('FCM_SERVER_KEY'),
    ],
];