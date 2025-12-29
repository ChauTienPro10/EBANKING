FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy jar
COPY authService.jar app.jar

# Mở port
EXPOSE 8000 9000

# Thêm biến môi trường Java options nếu cần
ENV JAVA_OPTS="-Xmx1024m"

# Chạy Spring Boot
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar --server.address=0.0.0.0 --server.port=8000"]
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy jar
COPY authService.jar app.jar

# Mở port
EXPOSE 8000 9000

# Thêm biến môi trường Java options nếu cần
ENV JAVA_OPTS="-Xmx1024m"

# Chạy Spring Boot
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar --server.address=0.0.0.0 --server.port=8000"]
