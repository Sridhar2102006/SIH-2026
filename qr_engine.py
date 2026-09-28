#!/usr/bin/env python3
"""
HONEYCHAIN — HIGH PERFORMANCE PYTHON QR CODE GENERATION ENGINE
=============================================================

Responsibilities:
1. Generates authentic, high-resolution QR codes for individual honey bottles.
2. Encodes local host consumer verification URLs for live demo verification.
3. Automatically outputs PNG, SVG, Base64 Data URI, and ASCII terminal previews.
4. Saves directly to `public/qr-codes/` so the local host Vite dev server immediately
   serves them to the frontend at `http://localhost:5173/qr-codes/<package_id>.png`.
5. Supports:
   - Standalone CLI execution: `python qr_engine.py --package PKG-2026-00125`
   - Batch Demo generation:    `python qr_engine.py --demo`
   - Local REST Microservice:  `python qr_engine.py --serve --port 5005`
"""

import sys
import os
import argparse
import base64
import json
import io
import time
from datetime import datetime
from pathlib import Path

# Enable UTF-8 encoding on Windows console if supported
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Third-party imports with graceful fallbacks
try:
    import qrcode
    from qrcode.constants import ERROR_CORRECT_H, ERROR_CORRECT_M
    import qrcode.image.svg
    from PIL import Image, ImageDraw, ImageFont
    HAS_QRCODE_PIL = True
except ImportError:
    HAS_QRCODE_PIL = False

try:
    from flask import Flask, request, jsonify, send_file, Response
    HAS_FLASK = True
except ImportError:
    HAS_FLASK = False

# Default configurations
DEFAULT_HOST = "http://localhost:5173"
DEFAULT_OUTPUT_DIR = Path(__file__).resolve().parent / "public" / "qr-codes"
BRAND_DARK = "#34261B"     # HoneyChain Deep Roasted Espresso
BRAND_GOLD = "#D99A24"     # HoneyChain Amber Gold
BRAND_LIGHT = "#FFFFFF"    # Clean White
BRAND_CREAM = "#FFFDF9"    # Honeycomb Warm Cream


def ensure_output_dir(output_dir: Path) -> Path:
    """Ensures output directory exists."""
    output_dir.mkdir(parents=True, exist_ok=True)
    return output_dir


def create_honeycomb_logo(size: int = 60) -> Image.Image:
    """Draws a crisp HoneyChain emblem to embed in the center of the QR code."""
    img = Image.new("RGBA", (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)

    # Draw rounded background badge
    pad = 4
    draw.rounded_rectangle(
        [(pad, pad), (size - pad, size - pad)],
        radius=8,
        fill="#FFFFFF",
        outline=BRAND_GOLD,
        width=2
    )

    # Draw center golden honeycomb hexagon
    cx, cy = size / 2, size / 2
    r = (size - pad * 4) / 2.8
    import math
    points = []
    for i in range(6):
        angle_deg = 60 * i - 30
        angle_rad = math.pi / 180 * angle_deg
        x = cx + r * math.cos(angle_rad)
        y = cy + r * math.sin(angle_rad)
        points.append((x, y))

    draw.polygon(points, fill=BRAND_GOLD, outline=BRAND_DARK)
    # Inner drop highlight
    inner_r = r * 0.45
    inner_points = []
    for i in range(6):
        angle_deg = 60 * i - 30
        angle_rad = math.pi / 180 * angle_deg
        x = cx + inner_r * math.cos(angle_rad)
        y = cy + inner_r * math.sin(angle_rad)
        inner_points.append((x, y))
    draw.polygon(inner_points, fill="#FFFFFF")

    return img


def generate_qr_bundle(
    package_id: str,
    public_ref: str = None,
    tamper_seal_id: str = None,
    batch_number: str = None,
    coa_document_id: str = None,
    product_name: str = "Wildflower Honey",
    host: str = DEFAULT_HOST,
    output_dir: Path = DEFAULT_OUTPUT_DIR,
    embed_logo: bool = True
) -> dict:
    """
    Generates a full QR Code bundle for a specific honey bottle:
    - High resolution PNG with custom HoneyChain brand palette
    - SVG vector output
    - Base64 encoded Data URI
    - Localhost Consumer Verification URL
    - JSON audit metadata
    """
    if not public_ref:
        year = datetime.now().year
        clean_pkg = package_id.replace("PKG-", "").replace("-", "")
        public_ref = f"HC-{year}-{clean_pkg}"

    if not tamper_seal_id:
        tamper_seal_id = f"HC-SEAL-{datetime.now().year}-925-J{package_id.split('-')[-1]}"

    if not batch_number:
        batch_number = "PB-2026-00041"

    if not coa_document_id:
        coa_document_id = "CoA-2026-NABL-098"

    # Local host consumer verification URL
    clean_host = host.rstrip("/")
    consumer_url = f"{clean_host}/?verify={public_ref}"

    ensure_output_dir(output_dir)

    qr_data = {
        "packageId": package_id,
        "publicReference": public_ref,
        "tamperSealId": tamper_seal_id,
        "batchNumber": batch_number,
        "coaDocumentId": coa_document_id,
        "productName": product_name,
        "consumerUrl": consumer_url,
        "qrRawPayload": consumer_url,
        "generatedAt": datetime.now().isoformat(),
        "engine": "HoneyChain Python QR Engine v2.0"
    }

    png_path = output_dir / f"{package_id}.png"
    svg_path = output_dir / f"{package_id}.svg"
    json_path = output_dir / f"{package_id}.json"

    base64_data_uri = ""
    ascii_art = ""

    if HAS_QRCODE_PIL:
        qr = qrcode.QRCode(
            version=None,
            error_correction=ERROR_CORRECT_H if embed_logo else ERROR_CORRECT_M,
            box_size=10,
            border=4,
        )
        qr.add_data(consumer_url)
        qr.make(fit=True)

        # Generate Pillow Image with custom HoneyChain palette
        img = qr.make_image(fill_color=BRAND_DARK, back_color=BRAND_LIGHT).convert("RGBA")

        # Optionally embed honeycomb logo in the center
        if embed_logo:
            img_w, img_h = img.size
            logo_size = int(img_w * 0.22)
            logo = create_honeycomb_logo(logo_size)
            pos = ((img_w - logo_size) // 2, (img_h - logo_size) // 2)
            img.paste(logo, pos, mask=logo)

        # Save PNG
        img.save(png_path, format="PNG")

        # Encode Base64
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        b64_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
        base64_data_uri = f"data:image/png;base64,{b64_str}"

        # Generate SVG
        try:
            svg_factory = qrcode.image.svg.SvgPathImage
            svg_qr = qrcode.QRCode(
                version=None,
                error_correction=ERROR_CORRECT_M,
                box_size=10,
                border=4,
                image_factory=svg_factory
            )
            svg_qr.add_data(consumer_url)
            svg_qr.make(fit=True)
            svg_img = svg_qr.make_image(fill_color=BRAND_DARK, back_color=BRAND_LIGHT)
            svg_img.save(str(svg_path))
        except Exception:
            pass

        # Generate ASCII Art for console preview
        ascii_io = io.StringIO()
        qr.print_ascii(out=ascii_io, invert=True)
        ascii_art = ascii_io.getvalue()

    # Save JSON metadata alongside image
    qr_data["pngPath"] = str(png_path)
    qr_data["svgPath"] = str(svg_path) if svg_path.exists() else None
    qr_data["base64"] = base64_data_uri
    qr_data["relativeWebPath"] = f"/qr-codes/{package_id}.png"

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(qr_data, f, indent=2)

    qr_data["ascii"] = ascii_art
    return qr_data


def generate_demo_batch(host: str = DEFAULT_HOST, output_dir: Path = DEFAULT_OUTPUT_DIR) -> list:
    """Generates QR codes for all default packages in the HoneyChain demo system."""
    demo_bottles = [
        {
            "package_id": "PKG-2026-00125",
            "public_ref": "HC-2026-00125",
            "tamper_seal_id": "HC-SEAL-2026-925-J125",
            "batch_number": "PB-2026-00041",
            "coa_document_id": "CoA-2026-NABL-098",
            "product_name": "Wildflower Raw Honey (500 g)"
        },
        {
            "package_id": "PKG-2026-00126",
            "public_ref": "HC-2026-00126",
            "tamper_seal_id": "HC-SEAL-2026-925-J126",
            "batch_number": "PB-2026-00041",
            "coa_document_id": "CoA-2026-NABL-098",
            "product_name": "Wildflower Raw Honey (500 g)"
        },
        {
            "package_id": "PKG-0042",
            "public_ref": "HC-PUB-PKG-0042",
            "tamper_seal_id": "HC-SEAL-2026-925-J42",
            "batch_number": "batch-hc-2409",
            "coa_document_id": "CoA-2026-NABL-042",
            "product_name": "Himalayan Forest Honey (500 g)"
        },
        {
            "package_id": "PKG-DEMO-S01",
            "public_ref": "HC-2409",
            "tamper_seal_id": "HC-SEAL-2026-925-S01",
            "batch_number": "BATCH-2409",
            "coa_document_id": "CoA-2026-NABL-001",
            "product_name": "Western Ghats Multifloral Honey"
        }
    ]

    results = []
    print(f"\n[HoneyChain Engine] Generating demo QR codes pointing to localhost ({host})...")
    for b in demo_bottles:
        res = generate_qr_bundle(
            package_id=b["package_id"],
            public_ref=b["public_ref"],
            tamper_seal_id=b["tamper_seal_id"],
            batch_number=b["batch_number"],
            coa_document_id=b["coa_document_id"],
            product_name=b["product_name"],
            host=host,
            output_dir=output_dir
        )
        results.append(res)
        print(f"  [OK] {b['package_id']} -> {res['consumerUrl']} (Saved: {res['relativeWebPath']})")

    return results


def start_server(port: int = 5005, host: str = "0.0.0.0", web_host: str = DEFAULT_HOST):
    """Starts a lightweight REST microservice to generate QR codes on demand."""
    if not HAS_FLASK:
        print("[ERROR] Flask is not installed. Run: pip install flask")
        sys.exit(1)

    app = Flask("honeychain_qr_engine")

    @app.after_request
    def add_cors_headers(response):
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
        return response

    @app.route("/health", methods=["GET"])
    def health():
        return jsonify({
            "status": "OK",
            "engine": "HoneyChain Python QR Engine",
            "timestamp": datetime.now().isoformat(),
            "targetConsumerHost": web_host
        })

    @app.route("/api/qr/generate", methods=["POST", "OPTIONS"])
    def api_generate():
        if request.method == "OPTIONS":
            return jsonify({"ok": True})

        data = request.get_json(force=True, silent=True) or {}
        package_id = data.get("packageId") or f"PKG-2026-{int(time.time())}"
        public_ref = data.get("publicReference")
        tamper_seal_id = data.get("tamperSealId")
        batch_number = data.get("batchNumber")
        coa_id = data.get("coaDocumentId")
        product_name = data.get("productName", "Wildflower Honey")
        req_host = data.get("host") or web_host

        result = generate_qr_bundle(
            package_id=package_id,
            public_ref=public_ref,
            tamper_seal_id=tamper_seal_id,
            batch_number=batch_number,
            coa_document_id=coa_id,
            product_name=product_name,
            host=req_host,
            output_dir=DEFAULT_OUTPUT_DIR
        )

        return jsonify({
            "success": True,
            "packageId": result["packageId"],
            "publicReference": result["publicReference"],
            "tamperSealId": result["tamperSealId"],
            "consumerUrl": result["consumerUrl"],
            "relativeWebPath": result["relativeWebPath"],
            "base64": result["base64"]
        })

    @app.route("/api/qr/<package_id>", methods=["GET"])
    def api_get_qr(package_id):
        png_path = DEFAULT_OUTPUT_DIR / f"{package_id}.png"
        if not png_path.exists():
            # Generate on the fly
            generate_qr_bundle(package_id=package_id, host=web_host)

        if png_path.exists():
            return send_file(png_path, mimetype="image/png")
        return jsonify({"error": "QR image not found"}), 404

    @app.route("/demo", methods=["GET"])
    def api_demo():
        results = generate_demo_batch(host=web_host)
        return jsonify({
            "success": True,
            "count": len(results),
            "consumerHost": web_host,
            "bottles": [
                {
                    "packageId": r["packageId"],
                    "publicReference": r["publicReference"],
                    "consumerUrl": r["consumerUrl"],
                    "webPath": r["relativeWebPath"]
                }
                for r in results
            ]
        })

    print(f"\n=======================================================")
    print(f"HONEYCHAIN PYTHON QR MICROSERVICE RUNNING")
    print(f"=======================================================")
    print(f"API Port:        http://localhost:{port}")
    print(f"Target Consumer: {web_host}")
    print(f"Output Directory:{DEFAULT_OUTPUT_DIR}")
    print(f"Demo Endpoint:   http://localhost:{port}/demo")
    print(f"Health:          http://localhost:{port}/health")
    print(f"=======================================================\n")
    app.run(host=host, port=port, debug=False)


def main():
    parser = argparse.ArgumentParser(description="HoneyChain Python QR Code Generator Engine")
    parser.add_argument("--package", "-p", type=str, default="PKG-2026-00125", help="Bottle / Package ID (e.g. PKG-2026-00125)")
    parser.add_argument("--ref", "-r", type=str, default=None, help="Public verification reference (e.g. HC-2026-00125)")
    parser.add_argument("--seal", "-s", type=str, default=None, help="Tamper-evident security seal ID")
    parser.add_argument("--batch", "-b", type=str, default="PB-2026-00041", help="Processing batch ID")
    parser.add_argument("--coa", type=str, default="CoA-2026-NABL-098", help="Laboratory Certificate of Analysis number")
    parser.add_argument("--product", type=str, default="Wildflower Honey", help="Honey product name")
    parser.add_argument("--host", type=str, default=DEFAULT_HOST, help="Localhost base URL for demo (default: http://localhost:5173)")
    parser.add_argument("--out", "-o", type=str, default=str(DEFAULT_OUTPUT_DIR), help="Output directory for generated QR codes")
    parser.add_argument("--demo", action="store_true", help="Generate QR codes for all demo bottles")
    parser.add_argument("--serve", action="store_true", help="Run as local HTTP REST microservice")
    parser.add_argument("--port", type=int, default=5005, help="Port for REST microservice (default: 5005)")

    args = parser.parse_args()

    out_dir = Path(args.out)

    if args.serve:
        start_server(port=args.port, web_host=args.host)
        return

    if args.demo:
        results = generate_demo_batch(host=args.host, output_dir=out_dir)
        print(f"\n[DONE] Successfully generated {len(results)} QR code bundles in '{out_dir}'.")
        return

    # Single package generation
    print(f"\n[HoneyChain Engine] Generating QR code for Bottle: {args.package}")
    bundle = generate_qr_bundle(
        package_id=args.package,
        public_ref=args.ref,
        tamper_seal_id=args.seal,
        batch_number=args.batch,
        coa_document_id=args.coa,
        product_name=args.product,
        host=args.host,
        output_dir=out_dir
    )

    print(f"=======================================================")
    print(f"Bottle ID:           {bundle['packageId']}")
    print(f"Public Reference:    {bundle['publicReference']}")
    print(f"Tamper Seal:         {bundle['tamperSealId']}")
    print(f"Processing Batch:    {bundle['batchNumber']}")
    print(f"Accredited CoA:      {bundle['coaDocumentId']}")
    print(f"Local Consumer URL:  {bundle['consumerUrl']}")
    print(f"PNG Output File:     {bundle['pngPath']}")
    print(f"Relative Web Path:   {bundle['relativeWebPath']}")
    print(f"=======================================================\n")

    if bundle.get("ascii"):
        print("Scannable Terminal QR Preview:")
        print(bundle["ascii"])
        print("\nTip: Scan above with your phone camera to test localhost verification URL!\n")


if __name__ == "__main__":
    main()
