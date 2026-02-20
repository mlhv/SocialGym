FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
# Pre-download the model so we don't download it every time container starts
RUN python -c "from transformers import pipeline; pipeline('sentiment-analysis')"
COPY analyzer.py .

ENV PYTHONUNBUFFERED=1
CMD ["python", "analyzer.py"]