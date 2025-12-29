FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY chatbotService.jar app.jar
EXPOSE 8007 
ENTRYPOINT ["java", "-jar", "app.jar"]