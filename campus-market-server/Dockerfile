# Stage 1: Build stage
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copy Maven wrapper files and pom.xml first to cache dependencies
COPY mvnw mvnw.cmd ./
COPY .mvn .mvn
COPY pom.xml ./

# Convert line endings of mvnw script (crucial for Linux container when repository is cloned on Windows)
RUN tr -d '\r' < mvnw > mvnw.tmp && mv mvnw.tmp mvnw && chmod +x mvnw

# Download dependencies (go-offline) to cache them
RUN ./mvnw dependency:go-offline

# Copy the rest of the application source code
COPY src ./src

# Build the application jar file (skipping tests for faster production builds)
RUN ./mvnw clean package -DskipTests

# Stage 2: Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the built jar file from the build stage
COPY --from=build /app/target/server-1.0.0-SNAPSHOT.jar app.jar

# Expose the server port (default 5000)
EXPOSE 5000

# Run the jar file
ENTRYPOINT ["java", "-jar", "app.jar"]
