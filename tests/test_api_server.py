#!/usr/bin/env python3
"""
HoneyChain API Server Automated Unit & Enterprise Health Test
Tests:
- Health probe (/api/health)
- Readiness probe (/api/readiness)
- Telemetry physics boundary validation (/api/iot/telemetry)
- Deduplication suppression
- Dispatch QR generation endpoint (/api/dispatch/qr)
"""

import sys
import unittest
import json
import os

# Add root directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

from backend.api_server import app

class TestHoneyChainAPIServer(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_01_health_probe(self):
        res = self.app.get('/api/health')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data.get('status'), 'HEALTHY')
        self.assertIn('uptimeSeconds', data)
        self.assertIn('X-Correlation-ID', res.headers)

    def test_02_readiness_probe(self):
        res = self.app.get('/api/readiness')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data.get('status'), 'READY')
        self.assertEqual(data['subsystems']['qrEngineSubsystem'], 'READY')

    def test_03_telemetry_valid(self):
        payload = {
            "deviceId": "ESP32-HIVE-001",
            "temperatureC": 34.5,
            "humidityPercent": 58.2,
            "weightKg": 42.1,
            "packetHash": "pkt_test_99901"
        }
        res = self.app.post('/api/iot/telemetry', json=payload)
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertTrue(data.get('success'))
        self.assertEqual(data['telemetry']['temperatureC'], 34.5)

    def test_04_telemetry_deduplication(self):
        payload = {
            "deviceId": "ESP32-HIVE-001",
            "temperatureC": 34.5,
            "humidityPercent": 58.2,
            "weightKg": 42.1,
            "packetHash": "pkt_test_99901" # duplicate
        }
        res = self.app.post('/api/iot/telemetry', json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data.get('status'), 'DUPLICATE_IGNORED')

    def test_05_telemetry_out_of_bounds(self):
        # Impossible temperature
        payload = {
            "deviceId": "ESP32-HIVE-001",
            "temperatureC": 180.0,
            "packetHash": "pkt_test_bad_temp"
        }
        res = self.app.post('/api/iot/telemetry', json=payload)
        self.assertEqual(res.status_code, 422)
        data = res.get_json()
        self.assertEqual(data['error']['code'], 'OUT_OF_BOUNDS_TELEMETRY')

    def test_06_dispatch_qr(self):
        payload = {
            "packageId": "PKG-2026-TEST-99",
            "publicReference": "HC-TEST-99",
            "batchNumber": "PB-2026-00041"
        }
        res = self.app.post('/api/dispatch/qr', json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data.get('success'))
        self.assertIn('http://localhost:5173/?verify=HC-TEST-99', data.get('publicUrl'))

if __name__ == '__main__':
    unittest.main()
