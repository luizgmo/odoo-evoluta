FROM odoo:19

USER root

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libzbar0 \
        poppler-utils \
    && rm -rf /var/lib/apt/lists/*

COPY deploy/odoo/requirements.txt /tmp/evoluta-requirements.txt

RUN pip3 install --no-cache-dir --break-system-packages \
        -r /tmp/evoluta-requirements.txt \
    && rm -f /tmp/evoluta-requirements.txt

USER odoo
