#!/bin/bash
export PATH="/Users/juanotalora/.local/node/bin:$PATH"
exec "/Users/juanotalora/.local/node/bin/node" "/Users/juanotalora/iso-go-company/node_modules/next/dist/bin/next" dev --webpack --port=3002
