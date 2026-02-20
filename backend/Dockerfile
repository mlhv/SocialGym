# Stage 1: Build the Application (Using Java 25)
FROM maven:3-eclipse-temurin-25 AS build
WORKDIR /app
COPY pom.xml .

RUN mvn dependency:go-offline 

COPY src ./src
# Clean and Package (skip tests to save time during build)
RUN mvn clean package -DskipTests

# Stage 2: Run the Application (Using Java 25 JRE)
FROM eclipse-temurin:25-jre
WORKDIR /app
# Copy the JAR from the build stage
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]