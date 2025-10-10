@echo off
echo Deleting Kafka topics...

docker exec -it kafka kafka-topics --delete --topic transaction --bootstrap-server localhost:9092
docker exec -it kafka kafka-topics --delete --topic send-email --bootstrap-server localhost:9092
docker exec -it kafka kafka-topics --delete --topic send-otp --bootstrap-server localhost:9092
docker exec -it kafka kafka-topics --delete --topic transfer-send-email --bootstrap-server localhost:9092
docker exec -it kafka kafka-topics --delete --topic transaction-notify --bootstrap-server localhost:9092
docker exec -it kafka kafka-topics --delete --topic transaction-processer --bootstrap-server localhost:9092

echo.
echo Listing remaining Kafka topics:
docker exec -it kafka kafka-topics --list --bootstrap-server localhost:9092

pause
