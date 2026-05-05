<?php
$xmlString = file_get_contents('https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-Indonesia.xml');
$xml = simplexml_load_string($xmlString);
echo 'AREAS: ' . count($xml->forecast->area) . PHP_EOL;
foreach($xml->forecast->area as $area) {
    if ((string)$area['description'] == 'Jakarta Pusat') {
        echo 'Found Jakarta Pusat. Code: ' . (string)$area['id'] . PHP_EOL;
    }
}
