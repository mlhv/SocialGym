from transformers import pipeline
from kafka import KafkaConsumer
import json
import os
import requests

sentiment_pipeline = pipeline("sentiment-analysis")

kafka_server = os.environ.get('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
consumer = KafkaConsumer(
    'social-events',
    bootstrap_servers=kafka_server,
    auto_offset_reset='earliest',
    value_deserializer=lambda x: json.loads(x.decode('utf-8'))
)

db_host = os.environ.get('DB_HOST', 'localhost')

for message in consumer:
    data = message.value
    user_text = data.get('content')
    msg_id = data.get('id')
    
    if user_text and msg_id:
        result = sentiment_pipeline(user_text)[0]
        
        sentiment_score = result['score'] if result['label'] == 'POSITIVE' else -result['score']
        
        print(f"Analyzed Message ID {msg_id}: {user_text[:20]} ... -> {sentiment_score:.2f}")
        
        try:
            requests.post(
                "http://backend:8080/api/sentiment",
                json={"id": msg_id, "sentimentScore": sentiment_score}
            )
            print(f"Sent sentiment score for Message ID {msg_id} to backend")
        except Exception as e:
            print(f"Failed to send to backend: {e}")
            
    



