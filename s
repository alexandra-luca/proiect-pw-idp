curl \
  --url 'localhost:8080/realms/Warbnb/protocol/openid-connect/token' \
  --header 'content-type: application/x-www-form-urlencoded' \
  --data username=host1 \
  --data password=123 \
  --data grant_type=password \
  --data client_id="warbnb-backend-nest" \
  --data client_secret="PF5JfUfuzywzMxSJPgViFR3HcBlEgFDY"