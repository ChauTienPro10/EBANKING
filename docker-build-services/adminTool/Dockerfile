FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY adminTool.jar app.jar
EXPOSE 7999 
ENTRYPOINT ["java", "-jar", "app.jar"]