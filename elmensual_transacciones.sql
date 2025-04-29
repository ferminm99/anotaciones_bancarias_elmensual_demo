-- MySQL dump 10.13  Distrib 8.0.39, for Win64 (x86_64)
--
-- Host: localhost    Database: elmensual_transacciones
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bancos`
--

DROP TABLE IF EXISTS `bancos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bancos` (
  `banco_id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `saldo_total` decimal(15,2) NOT NULL,
  PRIMARY KEY (`banco_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bancos`
--

LOCK TABLES `bancos` WRITE;
/*!40000 ALTER TABLE `bancos` DISABLE KEYS */;
INSERT INTO `bancos` VALUES (1,'Banco Galicia',50000.00),(2,'Banco Santander',30000.00);
/*!40000 ALTER TABLE `bancos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clientes`
--

DROP TABLE IF EXISTS `clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes` (
  `cliente_id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `apellido` varchar(255) NOT NULL,
  PRIMARY KEY (`cliente_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes`
--

LOCK TABLES `clientes` WRITE;
/*!40000 ALTER TABLE `clientes` DISABLE KEYS */;
INSERT INTO `clientes` VALUES (1,'Juan','Pérez'),(2,'María','García'),(3,'Carlos','López'),(4,'Ana','Fernández');
/*!40000 ALTER TABLE `clientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transacciones`
--

DROP TABLE IF EXISTS `transacciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transacciones` (
  `transaccion_id` int NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `tipo` enum('interdeposito','deposito_efectivo','cheque_deposito','transferencia','retiro_efectivo','retiro_cheque','impuesto','gastos_mantenimiento') NOT NULL,
  `monto` decimal(15,2) NOT NULL,
  `cliente_id` int DEFAULT NULL,
  `banco_id` int DEFAULT NULL,
  PRIMARY KEY (`transaccion_id`),
  KEY `cliente_id` (`cliente_id`),
  KEY `banco_id` (`banco_id`),
  CONSTRAINT `transacciones_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`cliente_id`),
  CONSTRAINT `transacciones_ibfk_2` FOREIGN KEY (`banco_id`) REFERENCES `bancos` (`banco_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transacciones`
--

LOCK TABLES `transacciones` WRITE;
/*!40000 ALTER TABLE `transacciones` DISABLE KEYS */;
INSERT INTO `transacciones` VALUES (1,'2024-10-01','interdeposito',1000.00,1,1),(2,'2024-10-02','deposito_efectivo',500.00,2,2),(3,'2024-10-03','cheque_deposito',2000.00,3,1),(4,'2024-10-04','transferencia',1500.00,1,2),(5,'2024-10-05','retiro_efectivo',300.00,2,1),(6,'2024-10-06','retiro_cheque',450.00,4,2),(7,'2024-10-07','impuesto',700.00,3,1),(8,'2024-10-08','gastos_mantenimiento',250.00,4,2);
/*!40000 ALTER TABLE `transacciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'elmensual_transacciones'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-10-11 11:51:50
