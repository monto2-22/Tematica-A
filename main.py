"""Entrada de consola para abrir WorldCave 2D."""

import argparse
import sys
import webbrowser
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description="Abre WorldCave 2D en el navegador.")
    parser.add_argument(
        "--ruta", action="store_true", help="Muestra la dirección del juego sin abrirlo."
    )
    args = parser.parse_args()
    index = Path(__file__).resolve().with_name("index.html")
    if not index.is_file():
        print(f"No se encontró el archivo del juego: {index}", file=sys.stderr)
        return 1

    url = index.as_uri()
    if args.ruta:
        print(url)
        return 0

    if not webbrowser.open(url):
        print(f"Abre esta dirección en tu navegador: {url}", file=sys.stderr)
        return 1

    print("WorldCave se abrió en el navegador.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
