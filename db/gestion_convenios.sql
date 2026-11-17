-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 17-11-2026 a las 23:50:38
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `gestion_convenios`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auditorias`
--

CREATE TABLE `auditorias` (
  `id_auditoria` int(11) NOT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `accion` varchar(100) NOT NULL,
  `entidad` varchar(100) NOT NULL,
  `entidad_id` int(11) DEFAULT NULL,
  `detalle` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`detalle`)),
  `ip` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `auditorias`
--

INSERT INTO `auditorias` (`id_auditoria`, `id_usuario`, `accion`, `entidad`, `entidad_id`, `detalle`, `ip`, `created_at`, `updated_at`) VALUES
(1, 2, 'crear', 'instrumentos', 3, '{\"codigo\":\"CONV-AUDIT-001\",\"titulo\":\"Convenio de prueba para auditor\\u00edas\",\"estado_inicial\":\"borrador\"}', '127.0.0.1', '2026-11-08 19:55:57', '2026-11-08 19:55:57'),
(2, 2, 'actualizar', 'instrumentos', 3, '{\"campos_modificados\":[\"titulo\",\"notas\"],\"codigo\":\"CONV-AUDIT-001\",\"titulo\":\"Convenio de prueba para auditor\\u00edas actualizado\"}', '127.0.0.1', '2026-11-08 19:56:23', '2026-11-08 19:56:23'),
(3, 2, 'cambiar_estado', 'instrumentos', 3, '{\"estado_anterior\":\"borrador\",\"estado_nuevo\":\"revision\",\"fundamento\":\"Se env\\u00eda a revisi\\u00f3n para probar el registro de auditor\\u00eda.\"}', '127.0.0.1', '2026-11-08 19:56:45', '2026-11-08 19:56:45'),
(4, 2, 'crear', 'instituciones', 3, '{\"nombre\":\"Instituci\\u00f3n de prueba auditor\\u00eda\",\"tipo_institucion\":\"universidad\"}', '127.0.0.1', '2026-11-08 20:01:28', '2026-11-08 20:01:28'),
(5, 2, 'actualizar', 'instituciones', 3, '{\"campos_modificados\":[\"nombre\",\"tipo_institucion\"],\"nombre\":\"Instituci\\u00f3n de prueba auditor\\u00eda actualizada\",\"tipo_institucion\":\"organismo_publico\"}', '127.0.0.1', '2026-11-08 20:01:47', '2026-11-08 20:01:47'),
(6, 2, 'crear', 'personas', 2, '{\"nombre\":\"Juan\",\"apellido\":\"P\\u00e9rez\",\"dni\":\"45999888\"}', '127.0.0.1', '2026-11-08 20:02:05', '2026-11-08 20:02:05'),
(7, 2, 'actualizar', 'personas', 2, '{\"campos_modificados\":[\"apellido\",\"correo\"],\"nombre\":\"Juan\",\"apellido\":\"P\\u00e9rez actualizado\"}', '127.0.0.1', '2026-11-08 20:02:20', '2026-11-08 20:02:20'),
(8, 2, 'crear', 'partes', 2, '{\"id_instrumento\":2,\"id_institucion\":1,\"caracter_parte\":\"Parte firmante\"}', '127.0.0.1', '2026-11-08 21:04:07', '2026-11-08 21:04:07'),
(9, 2, 'actualizar', 'partes', 2, '{\"campos_modificados\":[\"caracter_parte\",\"representante_cargo\"],\"id_instrumento\":2,\"id_institucion\":1}', '127.0.0.1', '2026-11-08 21:35:01', '2026-11-08 21:35:01'),
(10, 2, 'actualizar', 'partes', 2, '{\"campos_modificados\":[\"caracter_parte\",\"representante_cargo\"],\"id_instrumento\":2,\"id_institucion\":1}', '127.0.0.1', '2026-11-08 21:35:29', '2026-11-08 21:35:29'),
(11, 2, 'crear', 'instrumentos_relaciones', 6, '{\"id_instrumento_origen\":2,\"id_instrumento_destino\":3,\"tipo_relacion\":\"renueva\"}', '127.0.0.1', '2026-11-08 22:57:04', '2026-11-08 22:57:04'),
(12, 2, 'actualizar', 'instrumentos_relaciones', 6, '{\"campos_modificados\":[\"tipo_relacion\",\"descripcion\"],\"id_instrumento_origen\":2,\"id_instrumento_destino\":3,\"tipo_relacion\":\"modifica\"}', '127.0.0.1', '2026-11-08 23:23:36', '2026-11-08 23:23:36'),
(13, 2, 'actualizar', 'participaciones_personas', 1, '{\"campos_modificados\":[\"rol\",\"descripcion\"],\"id_persona\":1,\"id_instrumento\":1,\"rol\":\"Responsable actualizado\"}', '127.0.0.1', '2026-11-09 00:22:02', '2026-11-09 00:22:02'),
(14, 2, 'crear', 'pasantias', 2, '{\"id_instrumento\":1,\"id_persona_estudiante\":1,\"id_persona_tutor\":1,\"id_institucion_receptora\":2,\"carrera\":\"Ingenier\\u00eda en Sistemas\",\"estado\":\"planificada\"}', '127.0.0.1', '2026-11-09 01:12:52', '2026-11-09 01:12:52'),
(15, 2, 'actualizar', 'pasantias', 2, '{\"campos_modificados\":[\"carrera\",\"estado\"],\"id_instrumento\":1,\"id_persona_estudiante\":1,\"carrera\":\"Ingenier\\u00eda en Sistemas actualizada\",\"estado\":\"en_curso\"}', '127.0.0.1', '2026-11-09 01:13:19', '2026-11-09 01:13:19'),
(16, 2, 'crear', 'documentos', 4, '{\"id_instrumento\":\"2\",\"nombre\":\"tp6.Recursividad-EstrucDatos2026.pdf\",\"tipo_documento\":\"principal\",\"version\":1}', '127.0.0.1', '2026-11-09 01:20:04', '2026-11-09 01:20:04'),
(17, 2, 'crear_version', 'documentos', 5, '{\"id_instrumento\":1,\"id_documento_anterior\":2,\"nombre\":\"CU-02-consultar_catalogo.pdf\",\"tipo_documento\":\"principal\",\"version_anterior\":2,\"version_nueva\":3}', '127.0.0.1', '2026-11-09 01:20:33', '2026-11-09 01:20:33'),
(18, 2, 'crear_version', 'documentos', 6, '{\"id_instrumento\":2,\"id_documento_anterior\":4,\"nombre\":\"CU-02-consultar_catalogo.pdf\",\"tipo_documento\":\"principal\",\"version_anterior\":1,\"version_nueva\":2}', '127.0.0.1', '2026-11-09 01:20:53', '2026-11-09 01:20:53'),
(19, 2, 'crear', 'documentos', 7, '{\"id_instrumento\":\"3\",\"nombre\":\"tp4.Listas 2026.docx.pdf\",\"tipo_documento\":\"anexo\",\"version\":1}', '127.0.0.1', '2026-11-09 01:34:16', '2026-11-09 01:34:16'),
(20, 2, 'crear', 'documentos', 8, '{\"id_instrumento\":\"3\",\"nombre\":\"tp5.Lambda2026.pdf\",\"tipo_documento\":\"principal\",\"version\":1}', '127.0.0.1', '2026-11-09 01:39:02', '2026-11-09 01:39:02'),
(21, 2, 'crear_version', 'documentos', 9, '{\"id_instrumento\":3,\"id_documento_anterior\":7,\"nombre\":\"TP Integrador 1. L\\u00f3gica-2026 (2).pdf\",\"tipo_documento\":\"anexo\",\"version_anterior\":1,\"version_nueva\":2}', '127.0.0.1', '2026-11-09 02:30:38', '2026-11-09 02:30:38'),
(22, 2, 'crear_version', 'documentos', 10, '{\"id_instrumento\":3,\"id_documento_anterior\":9,\"nombre\":\"TP03 OCL_2026.docx (1).pdf\",\"tipo_documento\":\"anexo\",\"version_anterior\":2,\"version_nueva\":3}', '127.0.0.1', '2026-11-09 03:27:14', '2026-11-09 03:27:14'),
(23, 2, 'crear', 'observaciones', 2, '{\"id_instrumento\":1,\"id_estado_instrumento\":1,\"estado\":\"pendiente\"}', '127.0.0.1', '2026-11-09 04:38:59', '2026-11-09 04:38:59'),
(24, 2, 'responder', 'observaciones', 2, '{\"estado_anterior\":\"pendiente\",\"estado_nuevo\":\"respondida\"}', '127.0.0.1', '2026-11-09 04:39:23', '2026-11-09 04:39:23'),
(25, 2, 'resolver', 'observaciones', 2, '{\"estado_anterior\":\"respondida\",\"estado_nuevo\":\"resuelta\"}', '127.0.0.1', '2026-11-09 04:40:09', '2026-11-09 04:40:09'),
(26, 2, 'crear', 'observaciones', 3, '{\"id_instrumento\":3,\"id_estado_instrumento\":2,\"estado\":\"pendiente\"}', '127.0.0.1', '2026-11-09 07:11:51', '2026-11-09 07:11:51'),
(27, 2, 'responder', 'observaciones', 3, '{\"estado_anterior\":\"pendiente\",\"estado_nuevo\":\"respondida\"}', '127.0.0.1', '2026-11-09 07:13:16', '2026-11-09 07:13:16'),
(28, 2, 'resolver', 'observaciones', 3, '{\"estado_anterior\":\"respondida\",\"estado_nuevo\":\"resuelta\"}', '127.0.0.1', '2026-11-09 07:13:46', '2026-11-09 07:13:46'),
(29, 3, 'crear', 'instrumentos', 4, '{\"codigo\":\"CONV-GEST-001\",\"titulo\":\"Convenio de prueba para Gesti\\u00f3n\",\"estado_inicial\":\"borrador\"}', '127.0.0.1', '2026-11-09 18:21:05', '2026-11-09 18:21:05'),
(30, 3, 'cambiar_estado', 'instrumentos', 4, '{\"estado_anterior\":\"borrador\",\"estado_nuevo\":\"revision\",\"fundamento\":\"Env\\u00edo del instrumento para revisi\\u00f3n.\"}', '127.0.0.1', '2026-11-09 18:34:19', '2026-11-09 18:34:19'),
(31, 4, 'cambiar_estado', 'instrumentos', 4, '{\"estado_anterior\":\"revision\",\"estado_nuevo\":\"aprobado\",\"fundamento\":\"Instrumento revisado y aprobado.\"}', '127.0.0.1', '2026-11-09 19:13:28', '2026-11-09 19:13:28'),
(32, 4, 'crear', 'partes', 3, '{\"id_instrumento\":4,\"id_institucion\":1,\"caracter_parte\":\"Parte firmante principal\"}', '127.0.0.1', '2026-11-09 19:17:54', '2026-11-09 19:17:54'),
(33, 4, 'crear', 'partes', 4, '{\"id_instrumento\":4,\"id_institucion\":2,\"caracter_parte\":\"Parte firmante secundaria\"}', '127.0.0.1', '2026-11-09 19:18:17', '2026-11-09 19:18:17'),
(34, 4, 'cambiar_estado', 'instrumentos', 4, '{\"estado_anterior\":\"revision\",\"estado_nuevo\":\"aprobado\",\"fundamento\":\"Instrumento revisado. Cuenta con las dos partes firmantes requeridas.\"}', '127.0.0.1', '2026-11-09 19:24:13', '2026-11-09 19:24:13'),
(35, 4, 'cambiar_estado', 'instrumentos', 4, '{\"estado_anterior\":\"revision\",\"estado_nuevo\":\"borrador\",\"fundamento\":\"Se devuelve el instrumento a Gesti\\u00f3n para corregir observaciones.\"}', '127.0.0.1', '2026-11-09 19:25:22', '2026-11-09 19:25:22'),
(36, 3, 'actualizar', 'instrumentos', 4, '{\"campos_modificados\":[\"titulo\",\"objeto\",\"alcance\"],\"codigo\":\"CONV-GEST-001\",\"titulo\":\"Convenio de cooperaci\\u00f3n acad\\u00e9mica corregido\"}', '127.0.0.1', '2026-11-09 19:26:44', '2026-11-09 19:26:44'),
(37, 3, 'cambiar_estado', 'instrumentos', 4, '{\"estado_anterior\":\"borrador\",\"estado_nuevo\":\"revision\",\"fundamento\":\"Se corrigieron las observaciones y se reenv\\u00eda el instrumento para revisi\\u00f3n.\"}', '127.0.0.1', '2026-11-09 19:27:21', '2026-11-09 19:27:21'),
(38, 4, 'cambiar_estado', 'instrumentos', 4, '{\"estado_anterior\":\"revision\",\"estado_nuevo\":\"aprobado\",\"fundamento\":\"Se verificaron las correcciones y se aprueba el instrumento.\"}', '127.0.0.1', '2026-11-09 19:28:16', '2026-11-09 19:28:16'),
(39, 2, 'crear', 'instituciones', 4, '{\"nombre\":\"Instituci\\u00f3n de prueba Administraci\\u00f3n\",\"tipo_institucion\":\"organismo_publico\"}', '127.0.0.1', '2026-11-09 20:30:39', '2026-11-09 20:30:39'),
(40, 2, 'actualizar', 'instituciones', 3, '{\"campos_modificados\":[\"nombre\"],\"nombre\":\"Instituci\\u00f3n de prueba Administraci\\u00f3n actualizada\",\"tipo_institucion\":\"organismo_publico\"}', '127.0.0.1', '2026-11-09 20:30:58', '2026-11-09 20:30:58'),
(41, 2, 'crear', 'personas', 3, '{\"nombre\":\"Persona\",\"apellido\":\"Prueba\"}', '127.0.0.1', '2026-11-09 21:16:04', '2026-11-09 21:16:04'),
(42, 2, 'crear', 'personas', 4, '{\"nombre\":\"Persona\",\"apellido\":\"Prueba\"}', '127.0.0.1', '2026-11-09 21:19:00', '2026-11-09 21:19:00'),
(43, 3, 'crear', 'partes', 5, '{\"id_instrumento\":4,\"id_institucion\":3,\"caracter_parte\":\"Instituci\\u00f3n asociada\"}', '127.0.0.1', '2026-11-09 21:29:26', '2026-11-09 21:29:26'),
(44, 3, 'actualizar', 'partes', 5, '{\"campos_modificados\":[\"caracter_parte\"],\"id_instrumento\":4,\"id_institucion\":3}', '127.0.0.1', '2026-11-09 21:33:58', '2026-11-09 21:33:58'),
(45, 3, 'actualizar', 'instrumentos_relaciones', 6, '{\"campos_modificados\":[\"descripcion\"],\"id_instrumento_origen\":2,\"id_instrumento_destino\":3,\"tipo_relacion\":\"modifica\"}', '127.0.0.1', '2026-11-09 21:43:31', '2026-11-09 21:43:31'),
(46, 3, 'crear', 'instrumentos_relaciones', 7, '{\"id_instrumento_origen\":1,\"id_instrumento_destino\":3,\"tipo_relacion\":\"renueva\"}', '127.0.0.1', '2026-11-09 21:43:44', '2026-11-09 21:43:44'),
(47, 3, 'actualizar', 'instrumentos_relaciones', 7, '{\"campos_modificados\":[\"descripcion\"],\"id_instrumento_origen\":1,\"id_instrumento_destino\":3,\"tipo_relacion\":\"renueva\"}', '127.0.0.1', '2026-11-09 21:44:47', '2026-11-09 21:44:47'),
(48, 3, 'crear', 'participaciones_personas', 2, '{\"id_persona\":1,\"id_instrumento\":4,\"rol\":\"Investigador\"}', '127.0.0.1', '2026-11-13 07:07:50', '2026-11-13 07:07:50'),
(49, 3, 'actualizar', 'participaciones_personas', 2, '{\"campos_modificados\":[\"rol\",\"descripcion\"],\"id_persona\":1,\"id_instrumento\":4,\"rol\":\"Investigador principal\"}', '127.0.0.1', '2026-11-13 07:13:33', '2026-11-13 07:13:33'),
(50, 3, 'actualizar', 'participaciones_personas', 2, '{\"campos_modificados\":[\"rol\",\"descripcion\"],\"id_persona\":1,\"id_instrumento\":4,\"rol\":\"Investigador principal\"}', '127.0.0.1', '2026-11-13 07:13:36', '2026-11-13 07:13:36'),
(51, 3, 'crear', 'pasantias', 3, '{\"id_instrumento\":1,\"id_persona_estudiante\":1,\"id_persona_tutor\":1,\"id_institucion_receptora\":2,\"carrera\":\"Ingenier\\u00eda en Sistemas\",\"estado\":\"planificada\"}', '127.0.0.1', '2026-11-13 08:15:12', '2026-11-13 08:15:12'),
(52, 3, 'actualizar', 'pasantias', 3, '{\"campos_modificados\":[\"carrera\",\"horas_semanales\",\"actividades\",\"asignacion\",\"estado\"],\"id_instrumento\":1,\"id_persona_estudiante\":1,\"carrera\":\"Ingenier\\u00eda en Sistemas - UNLPam\",\"estado\":\"en_curso\"}', '127.0.0.1', '2026-11-13 08:15:48', '2026-11-13 08:15:48'),
(53, 3, 'descargar', 'documentos', 10, '{\"id_instrumento\":3,\"nombre\":\"TP03 OCL_2026.docx (1).pdf\"}', '127.0.0.1', '2026-11-13 08:34:17', '2026-11-13 08:34:17'),
(54, 3, 'crear_version', 'documentos', 11, '{\"id_instrumento\":3,\"id_documento_anterior\":10,\"nombre\":\"equivalencias.pdf\",\"tipo_documento\":\"anexo\",\"version_anterior\":3,\"version_nueva\":4}', '127.0.0.1', '2026-11-13 08:35:30', '2026-11-13 08:35:30'),
(55, 4, 'crear', 'observaciones', 4, '{\"id_instrumento\":3,\"id_estado_instrumento\":2,\"estado\":\"pendiente\"}', '127.0.0.1', '2026-11-14 03:50:11', '2026-11-14 03:50:11'),
(56, 3, 'responder', 'observaciones', 4, '{\"estado_anterior\":\"pendiente\",\"estado_nuevo\":\"respondida\"}', '127.0.0.1', '2026-11-14 03:51:52', '2026-11-14 03:51:52');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `documentos`
--

CREATE TABLE `documentos` (
  `id_documento` int(11) NOT NULL,
  `id_instrumento` int(11) NOT NULL,
  `id_usuario_subio` int(11) NOT NULL,
  `id_documento_anterior` int(11) DEFAULT NULL,
  `nombre` varchar(255) NOT NULL,
  `tipo_documento` enum('principal','anexo','dictamen','resolucion','otro') NOT NULL,
  `formato` varchar(20) NOT NULL DEFAULT 'PDF',
  `ruta_archivo` varchar(500) NOT NULL,
  `tamanio` bigint(20) NOT NULL,
  `hash_sha256` char(64) NOT NULL,
  `version` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Volcado de datos para la tabla `documentos`
--

INSERT INTO `documentos` (`id_documento`, `id_instrumento`, `id_usuario_subio`, `id_documento_anterior`, `nombre`, `tipo_documento`, `formato`, `ruta_archivo`, `tamanio`, `hash_sha256`, `version`, `created_at`, `updated_at`) VALUES
(1, 1, 2, NULL, 'TP03 OCL_2026.docx (1).pdf', 'principal', 'PDF', 'documentos/1/PwRsJTJCbtaqIhwy06QclHtuzCuzA0VHldGEKire.pdf', 315565, '2979166bb56e032f8375902822fa337755bb842f56f23409c0c496fcc1031269', 1, '2026-11-08 19:05:38', '2026-11-08 19:05:38'),
(2, 1, 2, 1, 'Abratte Regular- (3).pdf', 'principal', 'PDF', 'documentos/1/pRKvQ9uJ9uauQTCCLocoxURCXH29hBpx5epjtlKW.pdf', 479681, '40cadc0853fcd43ca8c16c1b5b5a402e64d4aa2c6ac18d8ccdb15e7847a67b99', 2, '2026-11-08 19:07:13', '2026-11-08 19:07:13'),
(4, 2, 2, NULL, 'tp6.Recursividad-EstrucDatos2026.pdf', 'principal', 'PDF', 'documentos/2/migOLqzvQHjgTkzKWTDaPsTnYLz24ZWJ32UfvmYd.pdf', 320714, '67168f2e6fbdf378a39679567d8ff0277e7753448c369ff83e242038ed77f3e5', 1, '2026-11-09 01:20:04', '2026-11-09 01:20:04'),
(5, 1, 2, 2, 'CU-02-consultar_catalogo.pdf', 'principal', 'PDF', 'documentos/1/c2PB2EPgXKoDRPBnEIJ7J6F9crrD9q0trQZxN28C.pdf', 23714, '72bc876b320d3be77757a4d997c29df9714e70b95aefb2c4dc75c844ee9751c3', 3, '2026-11-09 01:20:33', '2026-11-09 01:20:33'),
(6, 2, 2, 4, 'CU-02-consultar_catalogo.pdf', 'principal', 'PDF', 'documentos/2/zdscI3nV6wXahWDjLLEEYCPx5YaXPZoWnPT66CHn.pdf', 23714, '72bc876b320d3be77757a4d997c29df9714e70b95aefb2c4dc75c844ee9751c3', 2, '2026-11-09 01:20:53', '2026-11-09 01:20:53'),
(7, 3, 2, NULL, 'tp4.Listas 2026.docx.pdf', 'anexo', 'PDF', 'documentos/3/ocKa0gCP0qMOrYNXtkZHa1HARG4OBRq6BPJCaQgA.pdf', 187608, '3d8b8e2e7680f122a349f06034a55cf4a283eb9c09062684ba3b733be329fcc3', 1, '2026-11-09 01:34:16', '2026-11-09 01:34:16'),
(8, 3, 2, NULL, 'tp5.Lambda2026.pdf', 'principal', 'PDF', 'documentos/3/NoQPsvN8cSmlGl49MFXz8oUIEW235GYgB1Ob1gAe.pdf', 276922, '36f31f7a08d899ac86062cd8e736c456fc65545db4ceaa323871ff2ad93f7ff0', 1, '2026-11-09 01:39:02', '2026-11-09 01:39:02'),
(9, 3, 2, 7, 'TP Integrador 1. Lógica-2026 (2).pdf', 'anexo', 'PDF', 'documentos/3/YDFmrnrukVrDW56sGVoBYO2yAB2hIVLbw0JER1oE.pdf', 170036, 'ce6a999730d98fd7fac17c6c79130f92a122a6bf7e3a02b1329952440cc35151', 2, '2026-11-09 02:30:38', '2026-11-09 02:30:38'),
(10, 3, 2, 9, 'TP03 OCL_2026.docx (1).pdf', 'anexo', 'PDF', 'documentos/3/eUhoUMNljVI3uh5w3Xsyfo9E1yAqnfiHMF5VqLVB.pdf', 315565, '2979166bb56e032f8375902822fa337755bb842f56f23409c0c496fcc1031269', 3, '2026-11-09 03:27:14', '2026-11-09 03:27:14'),
(11, 3, 3, 10, 'equivalencias.pdf', 'anexo', 'PDF', 'documentos/3/IVvf9PQzqKNl86D2ISPMwgVxFAVtg9EL2SFzrsE8.pdf', 19700, 'e7b1d1284520a4d182f70d9ba1a6be2c67f2b1975ec9fbeef71a254faba788cf', 4, '2026-11-13 08:35:30', '2026-11-13 08:35:30');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estados`
--

CREATE TABLE `estados` (
  `id_estado` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `estados`
--

INSERT INTO `estados` (`id_estado`, `nombre`, `descripcion`, `created_at`, `updated_at`) VALUES
(1, 'borrador', 'Instrumento en etapa de carga inicial.', '2026-11-06 15:08:28', '2026-11-06 15:08:28'),
(2, 'revision', 'Instrumento enviado a revisión administrativa.', '2026-11-06 15:08:28', '2026-11-06 15:08:28'),
(3, 'aprobado', 'Instrumento aprobado administrativamente.', '2026-11-06 15:08:28', '2026-11-06 15:08:28'),
(4, 'firmado', 'Instrumento firmado por las partes.', '2026-11-06 15:08:28', '2026-11-06 15:08:28'),
(5, 'rescindido', 'Instrumento rescindido.', '2026-11-06 15:08:28', '2026-11-06 15:08:28'),
(6, 'archivado', 'Instrumento archivado.', '2026-11-06 15:08:28', '2026-11-06 15:08:28');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_estados`
--

CREATE TABLE `historial_estados` (
  `id_historial_estado` int(11) NOT NULL,
  `id_instrumento` int(11) NOT NULL,
  `id_estado_anterior` int(11) DEFAULT NULL,
  `id_estado_nuevo` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `fundamento` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `historial_estados`
--

INSERT INTO `historial_estados` (`id_historial_estado`, `id_instrumento`, `id_estado_anterior`, `id_estado_nuevo`, `id_usuario`, `fundamento`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 2, 2, 'El instrumento fue revisado y se encuentra listo para su evaluación.', '2026-11-06 20:41:00', '2026-11-06 20:41:00'),
(2, 1, 2, 1, 2, 'Se devuelve el instrumento para realizar correcciones.', '2026-11-06 20:46:11', '2026-11-06 20:46:11'),
(3, 3, 1, 2, 2, 'Se envía a revisión para probar el registro de auditoría.', '2026-11-08 19:56:45', '2026-11-08 19:56:45'),
(4, 4, 1, 2, 3, 'Envío del instrumento para revisión.', '2026-11-09 18:34:19', '2026-11-09 18:34:19'),
(5, 4, 2, 3, 4, 'Instrumento revisado y aprobado.', '2026-11-09 19:13:28', '2026-11-09 19:13:28'),
(6, 4, 2, 3, 4, 'Instrumento revisado. Cuenta con las dos partes firmantes requeridas.', '2026-11-09 19:24:13', '2026-11-09 19:24:13'),
(7, 4, 2, 1, 4, 'Se devuelve el instrumento a Gestión para corregir observaciones.', '2026-11-09 19:25:22', '2026-11-09 19:25:22'),
(8, 4, 1, 2, 3, 'Se corrigieron las observaciones y se reenvía el instrumento para revisión.', '2026-11-09 19:27:21', '2026-11-09 19:27:21'),
(9, 4, 2, 3, 4, 'Se verificaron las correcciones y se aprueba el instrumento.', '2026-11-09 19:28:16', '2026-11-09 19:28:16');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `instituciones`
--

CREATE TABLE `instituciones` (
  `id_institucion` int(11) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `tipo_institucion` varchar(100) NOT NULL,
  `cuit` varchar(13) DEFAULT NULL,
  `domicilio` varchar(200) NOT NULL,
  `localidad` varchar(100) NOT NULL,
  `provincia` varchar(100) NOT NULL,
  `correo` varchar(150) DEFAULT NULL,
  `telefono` varchar(30) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `instituciones`
--

INSERT INTO `instituciones` (`id_institucion`, `nombre`, `tipo_institucion`, `cuit`, `domicilio`, `localidad`, `provincia`, `correo`, `telefono`, `created_at`, `updated_at`) VALUES
(1, 'Municipalidad de General Pico', 'organismo_publico', '30999999991', 'Avenida San Martín 500', 'General Pico', 'La Pampa', 'contacto@municipalidad.test', '2302987654', '2026-11-06 20:53:23', '2026-11-06 21:03:27'),
(2, 'Universidad Nacional de prueba', 'universidad', '30987654321', 'Calle Falsa 123', 'General Pico', 'La Pampa', 'contacto@universidad.test', '2302123456', '2026-11-08 10:09:15', '2026-11-08 10:09:15'),
(3, 'Institución de prueba Administración actualizada', 'organismo_publico', '30999888777', 'Calle de prueba 123', 'General Pico', 'La Pampa', 'institucion.audit@test.com', '2302998877', '2026-11-08 20:01:28', '2026-11-09 20:30:58'),
(4, 'Institución de prueba Administración', 'organismo_publico', '30911222334', 'Calle de prueba 100', 'General Pico', 'La Pampa', 'admin.institucion@test.com', '2302112233', '2026-11-09 20:30:39', '2026-11-09 20:30:39');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `instrumentos`
--

CREATE TABLE `instrumentos` (
  `id_instrumento` int(11) NOT NULL,
  `codigo` varchar(50) NOT NULL,
  `titulo` varchar(250) NOT NULL,
  `id_tipo_instrumento` int(11) NOT NULL,
  `id_unidad` int(11) NOT NULL,
  `id_estado` int(11) NOT NULL,
  `objeto` text DEFAULT NULL,
  `alcance` text DEFAULT NULL,
  `obligaciones` text DEFAULT NULL,
  `rescision` text DEFAULT NULL,
  `marco_legal` text DEFAULT NULL,
  `resolucion` varchar(150) DEFAULT NULL,
  `expediente_referencia` varchar(150) DEFAULT NULL,
  `condiciones_renovacion` text DEFAULT NULL,
  `confidencialidad` text DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `fecha_firma` date DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `plazo_preaviso` int(11) DEFAULT NULL,
  `version` int(11) NOT NULL DEFAULT 1,
  `id_usuario_creador` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Volcado de datos para la tabla `instrumentos`
--

INSERT INTO `instrumentos` (`id_instrumento`, `codigo`, `titulo`, `id_tipo_instrumento`, `id_unidad`, `id_estado`, `objeto`, `alcance`, `obligaciones`, `rescision`, `marco_legal`, `resolucion`, `expediente_referencia`, `condiciones_renovacion`, `confidencialidad`, `notas`, `fecha_firma`, `fecha_inicio`, `fecha_vencimiento`, `plazo_preaviso`, `version`, `id_usuario_creador`, `created_at`, `updated_at`) VALUES
(1, 'CONV-TEST-001', 'Convenio de cooperación académica actualizado', 1, 1, 1, 'Establecer vínculos de cooperación entre instituciones.', 'Actividades de investigación y formación.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 30, 1, 2, '2026-11-06 20:26:03', '2026-11-06 20:46:11'),
(2, 'CONV-TEST-002', 'Convenio específico de investigación', 1, 1, 1, 'Desarrollar actividades conjuntas de investigación.', 'Cooperación académica.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 30, 1, 2, '2026-11-08 10:23:30', '2026-11-08 10:23:30'),
(3, 'CONV-AUDIT-001', 'Convenio de prueba para auditorías actualizado', 1, 1, 2, 'Prueba del registro automático de auditorías.', 'Actividades académicas.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Se modificó para comprobar el registro de auditoría.', NULL, NULL, NULL, 30, 1, 2, '2026-11-08 19:55:57', '2026-11-08 19:56:45'),
(4, 'CONV-GEST-001', 'Convenio de cooperación académica corregido', 1, 1, 3, 'Establecer vínculos de cooperación entre instituciones, incluyendo actividades académicas y de investigación.', 'Actividades de investigación, formación y cooperación académica.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 30, 1, 3, '2026-11-09 18:21:05', '2026-11-09 19:28:16'),
(5, 'CONV-UNI2-001', 'Convenio de prueba - Facultad de Ingeniería', 1, 2, 1, 'Instrumento de prueba para aislamiento entre unidades.', 'Facultad de Ingeniería', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 30, 1, 6, '2026-11-09 19:38:20', '2026-11-09 19:38:20');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `instrumentos_relaciones`
--

CREATE TABLE `instrumentos_relaciones` (
  `id_instrumento_relacion` int(11) NOT NULL,
  `id_instrumento_origen` int(11) NOT NULL,
  `id_instrumento_destino` int(11) NOT NULL,
  `tipo_relacion` enum('especifico_de','modifica','renueva','sustituye') NOT NULL,
  `descripcion` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Volcado de datos para la tabla `instrumentos_relaciones`
--

INSERT INTO `instrumentos_relaciones` (`id_instrumento_relacion`, `id_instrumento_origen`, `id_instrumento_destino`, `tipo_relacion`, `descripcion`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 'modifica', 'Adenda de prueba para modificar el convenio.', '2026-11-08 10:24:55', '2026-11-08 10:24:55'),
(6, 2, 3, 'modifica', 'Relación actualizada por el usuario de Gestión.', '2026-11-08 22:57:04', '2026-11-09 21:43:31'),
(7, 1, 3, 'renueva', 'Relación actualizada por el usuario de Gestión.', '2026-11-09 21:43:44', '2026-11-09 21:44:47');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2026_10_23_000704_create_personal_access_tokens_table', 1),
(2, '0001_01_01_000000_create_users_table', 2),
(3, '0001_01_01_000001_create_cache_table', 2),
(4, '0001_01_01_000002_create_jobs_table', 2),
(5, '2026_11_17_221102_agregar_activo_a_usuarios_table', 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones`
--

CREATE TABLE `notificaciones` (
  `id_notificacion` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_instrumento` int(11) DEFAULT NULL,
  `tipo` enum('revision_asignada','cambio_estado','preaviso','vencimiento') NOT NULL,
  `mensaje` varchar(500) NOT NULL,
  `leida_en` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `observaciones`
--

CREATE TABLE `observaciones` (
  `id_observacion` int(11) NOT NULL,
  `id_instrumento` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_estado_instrumento` int(11) NOT NULL,
  `contenido` text NOT NULL,
  `estado` enum('pendiente','respondida','resuelta') NOT NULL DEFAULT 'pendiente',
  `respuesta` text DEFAULT NULL,
  `id_usuario_respondio` int(11) DEFAULT NULL,
  `respondida_en` datetime DEFAULT NULL,
  `id_usuario_resolvio` int(11) DEFAULT NULL,
  `resuelta_en` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `observaciones`
--

INSERT INTO `observaciones` (`id_observacion`, `id_instrumento`, `id_usuario`, `id_estado_instrumento`, `contenido`, `estado`, `respuesta`, `id_usuario_respondio`, `respondida_en`, `id_usuario_resolvio`, `resuelta_en`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 1, 'Se solicita revisar las obligaciones establecidas en el convenio.', 'resuelta', 'Se revisaron las obligaciones y se realizaron las correcciones correspondientes.', 2, '2026-11-08 16:32:20', 2, '2026-11-08 16:32:34', '2026-11-08 19:32:05', '2026-11-08 19:32:34'),
(2, 1, 2, 1, 'Se solicita revisar la documentación del convenio.', 'resuelta', 'Se revisó la documentación y se realizaron las correcciones correspondientes.', 2, '2026-11-09 01:39:23', 2, '2026-11-09 01:40:09', '2026-11-09 04:38:59', '2026-11-09 04:40:09'),
(3, 3, 2, 2, 'Se solicita revisar la documentación adjunta.', 'resuelta', 'La documentación fue revisada correctamente. No se requieren modificaciones.', 2, '2026-11-09 04:13:16', 2, '2026-11-09 04:13:46', '2026-11-09 07:11:51', '2026-11-09 07:13:46'),
(4, 3, 4, 2, 'Se solicita corregir la documentación adjunta al convenio.', 'respondida', 'Se corrigió la documentación y se adjuntó la versión actualizada del convenio.', 3, '2026-11-14 00:51:52', NULL, NULL, '2026-11-14 03:50:11', '2026-11-14 03:51:52');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `partes`
--

CREATE TABLE `partes` (
  `id_parte` int(11) NOT NULL,
  `id_instrumento` int(11) NOT NULL,
  `id_institucion` int(11) NOT NULL,
  `caracter_parte` varchar(100) NOT NULL,
  `id_persona_representante` int(11) DEFAULT NULL,
  `representante_cargo` varchar(150) DEFAULT NULL,
  `firmado_en` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `partes`
--

INSERT INTO `partes` (`id_parte`, `id_instrumento`, `id_institucion`, `caracter_parte`, `id_persona_representante`, `representante_cargo`, `firmado_en`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 'Parte firmante principal', 1, 'Rector', '2026-11-08', '2026-11-08 10:21:22', '2026-11-08 10:22:15'),
(2, 2, 1, 'Parte firmante actualizada', 1, 'Director institucional', '2026-11-08', '2026-11-08 21:04:07', '2026-11-08 21:35:01'),
(3, 4, 1, 'Parte firmante principal', 1, 'Director institucional', NULL, '2026-11-09 19:17:54', '2026-11-09 19:17:54'),
(4, 4, 2, 'Parte firmante secundaria', 1, 'Rector', NULL, '2026-11-09 19:18:17', '2026-11-09 19:18:17'),
(5, 4, 3, 'Institución participante actualizada', NULL, NULL, NULL, '2026-11-09 21:29:26', '2026-11-09 21:33:58');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `participaciones_personas`
--

CREATE TABLE `participaciones_personas` (
  `id_participacion_persona` int(11) NOT NULL,
  `id_persona` int(11) NOT NULL,
  `id_instrumento` int(11) NOT NULL,
  `rol` varchar(100) NOT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Volcado de datos para la tabla `participaciones_personas`
--

INSERT INTO `participaciones_personas` (`id_participacion_persona`, `id_persona`, `id_instrumento`, `rol`, `fecha_inicio`, `fecha_fin`, `descripcion`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'Responsable actualizado', '2026-11-08', NULL, 'Participación modificada para comprobar la auditoría.', '2026-11-08 18:42:22', '2026-11-09 00:22:02'),
(2, 1, 4, 'Investigador principal', '2026-11-13', '2027-11-13', 'Participación actualizada por Gestión.', '2026-11-13 07:07:50', '2026-11-13 07:13:33');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pasantias`
--

CREATE TABLE `pasantias` (
  `id_pasantia` int(11) NOT NULL,
  `id_instrumento` int(11) NOT NULL,
  `id_persona_estudiante` int(11) NOT NULL,
  `id_persona_tutor` int(11) DEFAULT NULL,
  `id_institucion_receptora` int(11) NOT NULL,
  `id_persona_responsable_receptor` int(11) DEFAULT NULL,
  `carrera` varchar(150) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `horas_semanales` int(11) NOT NULL,
  `actividades` text NOT NULL,
  `asignacion` varchar(150) DEFAULT NULL,
  `seguro` varchar(150) DEFAULT NULL,
  `estado` enum('planificada','en_curso','finalizada','cancelada') NOT NULL DEFAULT 'planificada',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Volcado de datos para la tabla `pasantias`
--

INSERT INTO `pasantias` (`id_pasantia`, `id_instrumento`, `id_persona_estudiante`, `id_persona_tutor`, `id_institucion_receptora`, `id_persona_responsable_receptor`, `carrera`, `fecha_inicio`, `fecha_fin`, `horas_semanales`, `actividades`, `asignacion`, `seguro`, `estado`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 2, 1, 'Ingeniería en Sistemas', '2026-11-10', '2027-02-10', 25, 'Desarrollo, pruebas y mantenimiento de sistemas informáticos.', 'Sin asignación económica', 'Seguro de accidentes personales', 'en_curso', '2026-11-08 18:46:25', '2026-11-08 18:47:51'),
(2, 1, 1, 1, 2, 1, 'Ingeniería en Sistemas actualizada', '2027-03-01', '2027-07-01', 20, 'Actividades de desarrollo y análisis de sistemas.', 'Asignación de prueba', 'Seguro de prueba', 'en_curso', '2026-11-09 01:12:52', '2026-11-09 01:13:19'),
(3, 1, 1, 1, 2, 1, 'Ingeniería en Sistemas - UNLPam', '2027-04-01', '2027-07-01', 15, 'Desarrollo de software, pruebas y documentación técnica.', 'Asignación económica mensual', 'Seguro de accidentes personales', 'en_curso', '2026-11-13 08:15:12', '2026-11-13 08:15:48');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personas`
--

CREATE TABLE `personas` (
  `id_persona` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `dni` varchar(20) DEFAULT NULL,
  `correo` varchar(150) DEFAULT NULL,
  `telefono` varchar(30) DEFAULT NULL,
  `id_institucion` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `personas`
--

INSERT INTO `personas` (`id_persona`, `nombre`, `apellido`, `dni`, `correo`, `telefono`, `id_institucion`, `created_at`, `updated_at`) VALUES
(1, 'Carlos', 'Gonzalez', '40123456', 'carlos@gmail.com', '2302112233', 2, '2026-11-08 10:09:39', '2026-11-08 10:09:39'),
(2, 'Juan', 'Pérez actualizado', '45999888', 'juan.actualizado@test.com', '2302998877', 1, '2026-11-08 20:02:05', '2026-11-08 20:02:20'),
(3, 'Persona', 'Prueba', '99999999', 'persona.prueba@test.com', '2302000000', 1, '2026-11-09 21:16:04', '2026-11-09 21:16:04'),
(4, 'Persona', 'Prueba', '99999991', 'persona.prueba@test.com', '2302000000', 1, '2026-11-09 21:19:00', '2026-11-09 21:19:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipos_instrumento`
--

CREATE TABLE `tipos_instrumento` (
  `id_tipo_instrumento` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `tipos_instrumento`
--

INSERT INTO `tipos_instrumento` (`id_tipo_instrumento`, `nombre`, `descripcion`, `created_at`, `updated_at`) VALUES
(1, 'convenio_marco', 'Convenio general de colaboración entre instituciones.', '2026-11-06 15:08:28', '2026-11-06 15:08:28'),
(2, 'convenio_especifico', 'Convenio específico derivado de un convenio marco.', '2026-11-06 15:08:28', '2026-11-06 15:08:28'),
(3, 'convenio_pasantia', 'Instrumento relacionado con actividades de pasantía.', '2026-11-06 15:08:28', '2026-11-06 15:08:28'),
(4, 'adenda', 'Instrumento que modifica otro instrumento.', '2026-11-06 15:08:28', '2026-11-06 15:08:28'),
(5, 'renovacion', 'Instrumento relacionado con la renovación de otro.', '2026-11-06 15:08:28', '2026-11-06 15:08:28'),
(6, 'sustitucion', 'Instrumento que sustituye a un instrumento anterior.', '2026-11-06 15:08:28', '2026-11-06 15:08:28');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `unidades`
--

CREATE TABLE `unidades` (
  `id_unidad` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `tipo_unidad` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `id_unidad_padre` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `unidades`
--

INSERT INTO `unidades` (`id_unidad`, `nombre`, `tipo_unidad`, `descripcion`, `id_unidad_padre`, `created_at`, `updated_at`) VALUES
(1, 'Administración Central', 'administrativa', 'Unidad administrativa de prueba', NULL, '2026-11-06 20:21:01', '2026-11-06 20:21:01'),
(2, 'Facultad de Ingeniería', 'Académica', 'Unidad de prueba para verificar el aislamiento de datos', NULL, '2026-11-09 16:36:13', '2026-11-09 16:36:13');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('administracion','gestion','revision','consulta') NOT NULL,
  `id_unidad` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `name`, `email`, `password`, `rol`, `id_unidad`, `created_at`, `updated_at`, `activo`) VALUES
(2, 'Administrador', 'admin@convenios.test', '$2y$12$wEU35Mq3KJCIcdbyFuHFK.CM5nDMiImgFNKpFXSfw.sm2OIPk.8PO', 'administracion', 1, '2026-11-06 20:21:12', '2026-11-17 04:44:33', 1),
(3, 'Usuario Gestion', 'gestion@convenios.test', '$2y$12$fx28nPleNvNWHWlslxILp.QTTcmrns9ncP27/goCA795kEx74kN.2', 'gestion', 1, '2026-11-09 18:19:17', '2026-11-17 04:44:33', 1),
(4, 'Usuario Revision', 'revision@convenios.test', '$2y$12$MdbRGApba3XI4Bmiof9X6.T7s6YM3RW8X9UAt5VcJzF1P0J11AlAW', 'revision', 1, '2026-11-09 18:21:27', '2026-11-09 18:21:27', 1),
(5, 'Usuario Consulta', 'consulta@convenios.test', '$2y$12$qasJbLVp4vNTLFNQ9.zMQuXwEOWDGYO4Nwi7ZL07Sx.3xQ99pyApC', 'consulta', 1, '2026-11-09 19:29:59', '2026-11-17 04:44:34', 1),
(6, 'Usuario Gestion Facultad', 'gestion.facultad@convenios.test', '$2y$12$SDmynsVk43dqlvVw/P9Lre9HIDw5sVueh3Jq8C2CucnY0DV/pjDMO', 'gestion', 2, '2026-11-09 19:37:48', '2026-11-17 04:44:33', 1);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `auditorias`
--
ALTER TABLE `auditorias`
  ADD PRIMARY KEY (`id_auditoria`),
  ADD KEY `fk_auditoria_usuario` (`id_usuario`);

--
-- Indices de la tabla `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indices de la tabla `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indices de la tabla `documentos`
--
ALTER TABLE `documentos`
  ADD PRIMARY KEY (`id_documento`),
  ADD UNIQUE KEY `uq_documento_hash` (`id_instrumento`,`hash_sha256`),
  ADD UNIQUE KEY `uq_documento_anterior` (`id_documento_anterior`),
  ADD UNIQUE KEY `uq_documento_version` (`id_documento_anterior`),
  ADD KEY `fk_documento_usuario` (`id_usuario_subio`);

--
-- Indices de la tabla `estados`
--
ALTER TABLE `estados`
  ADD PRIMARY KEY (`id_estado`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indices de la tabla `historial_estados`
--
ALTER TABLE `historial_estados`
  ADD PRIMARY KEY (`id_historial_estado`),
  ADD KEY `fk_historial_instrumento` (`id_instrumento`),
  ADD KEY `fk_historial_estado_anterior` (`id_estado_anterior`),
  ADD KEY `fk_historial_estado_nuevo` (`id_estado_nuevo`),
  ADD KEY `fk_historial_usuario` (`id_usuario`);

--
-- Indices de la tabla `instituciones`
--
ALTER TABLE `instituciones`
  ADD PRIMARY KEY (`id_institucion`),
  ADD UNIQUE KEY `cuit` (`cuit`);

--
-- Indices de la tabla `instrumentos`
--
ALTER TABLE `instrumentos`
  ADD PRIMARY KEY (`id_instrumento`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `fk_instrumento_tipo` (`id_tipo_instrumento`),
  ADD KEY `fk_instrumento_unidad` (`id_unidad`),
  ADD KEY `fk_instrumento_estado` (`id_estado`),
  ADD KEY `fk_instrumento_usuario` (`id_usuario_creador`);

--
-- Indices de la tabla `instrumentos_relaciones`
--
ALTER TABLE `instrumentos_relaciones`
  ADD PRIMARY KEY (`id_instrumento_relacion`),
  ADD UNIQUE KEY `uq_instrumentos_relacion` (`id_instrumento_origen`,`id_instrumento_destino`,`tipo_relacion`),
  ADD KEY `fk_relacion_destino` (`id_instrumento_destino`);

--
-- Indices de la tabla `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indices de la tabla `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD PRIMARY KEY (`id_notificacion`),
  ADD KEY `fk_notificacion_usuario` (`id_usuario`),
  ADD KEY `fk_notificacion_instrumento` (`id_instrumento`);

--
-- Indices de la tabla `observaciones`
--
ALTER TABLE `observaciones`
  ADD PRIMARY KEY (`id_observacion`),
  ADD KEY `fk_observacion_instrumento` (`id_instrumento`),
  ADD KEY `fk_observacion_usuario` (`id_usuario`),
  ADD KEY `fk_observacion_estado_instrumento` (`id_estado_instrumento`),
  ADD KEY `fk_observacion_respondio` (`id_usuario_respondio`),
  ADD KEY `fk_observacion_resolvio` (`id_usuario_resolvio`);

--
-- Indices de la tabla `partes`
--
ALTER TABLE `partes`
  ADD PRIMARY KEY (`id_parte`),
  ADD UNIQUE KEY `uq_parte_instrumento_institucion` (`id_instrumento`,`id_institucion`),
  ADD KEY `fk_parte_institucion` (`id_institucion`),
  ADD KEY `fk_parte_representante` (`id_persona_representante`);

--
-- Indices de la tabla `participaciones_personas`
--
ALTER TABLE `participaciones_personas`
  ADD PRIMARY KEY (`id_participacion_persona`),
  ADD KEY `fk_participacion_persona` (`id_persona`),
  ADD KEY `fk_participacion_instrumento` (`id_instrumento`);

--
-- Indices de la tabla `pasantias`
--
ALTER TABLE `pasantias`
  ADD PRIMARY KEY (`id_pasantia`),
  ADD KEY `fk_pasantia_instrumento` (`id_instrumento`),
  ADD KEY `fk_pasantia_estudiante` (`id_persona_estudiante`),
  ADD KEY `fk_pasantia_tutor` (`id_persona_tutor`),
  ADD KEY `fk_pasantia_institucion` (`id_institucion_receptora`),
  ADD KEY `fk_pasantia_responsable` (`id_persona_responsable_receptor`);

--
-- Indices de la tabla `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indices de la tabla `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indices de la tabla `personas`
--
ALTER TABLE `personas`
  ADD PRIMARY KEY (`id_persona`),
  ADD UNIQUE KEY `dni` (`dni`),
  ADD KEY `fk_persona_institucion` (`id_institucion`);

--
-- Indices de la tabla `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indices de la tabla `tipos_instrumento`
--
ALTER TABLE `tipos_instrumento`
  ADD PRIMARY KEY (`id_tipo_instrumento`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `unidades`
--
ALTER TABLE `unidades`
  ADD PRIMARY KEY (`id_unidad`),
  ADD KEY `fk_unidad_padre` (`id_unidad_padre`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_usuario_unidad` (`id_unidad`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `auditorias`
--
ALTER TABLE `auditorias`
  MODIFY `id_auditoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT de la tabla `documentos`
--
ALTER TABLE `documentos`
  MODIFY `id_documento` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `estados`
--
ALTER TABLE `estados`
  MODIFY `id_estado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `historial_estados`
--
ALTER TABLE `historial_estados`
  MODIFY `id_historial_estado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `instituciones`
--
ALTER TABLE `instituciones`
  MODIFY `id_institucion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `instrumentos`
--
ALTER TABLE `instrumentos`
  MODIFY `id_instrumento` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `instrumentos_relaciones`
--
ALTER TABLE `instrumentos_relaciones`
  MODIFY `id_instrumento_relacion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  MODIFY `id_notificacion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `observaciones`
--
ALTER TABLE `observaciones`
  MODIFY `id_observacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `partes`
--
ALTER TABLE `partes`
  MODIFY `id_parte` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `participaciones_personas`
--
ALTER TABLE `participaciones_personas`
  MODIFY `id_participacion_persona` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pasantias`
--
ALTER TABLE `pasantias`
  MODIFY `id_pasantia` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `personas`
--
ALTER TABLE `personas`
  MODIFY `id_persona` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `tipos_instrumento`
--
ALTER TABLE `tipos_instrumento`
  MODIFY `id_tipo_instrumento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `unidades`
--
ALTER TABLE `unidades`
  MODIFY `id_unidad` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `auditorias`
--
ALTER TABLE `auditorias`
  ADD CONSTRAINT `fk_auditoria_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `documentos`
--
ALTER TABLE `documentos`
  ADD CONSTRAINT `fk_documento_anterior` FOREIGN KEY (`id_documento_anterior`) REFERENCES `documentos` (`id_documento`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_documento_instrumento` FOREIGN KEY (`id_instrumento`) REFERENCES `instrumentos` (`id_instrumento`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_documento_usuario` FOREIGN KEY (`id_usuario_subio`) REFERENCES `usuarios` (`id_usuario`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `historial_estados`
--
ALTER TABLE `historial_estados`
  ADD CONSTRAINT `fk_historial_estado_anterior` FOREIGN KEY (`id_estado_anterior`) REFERENCES `estados` (`id_estado`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_historial_estado_nuevo` FOREIGN KEY (`id_estado_nuevo`) REFERENCES `estados` (`id_estado`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_historial_instrumento` FOREIGN KEY (`id_instrumento`) REFERENCES `instrumentos` (`id_instrumento`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_historial_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `instrumentos`
--
ALTER TABLE `instrumentos`
  ADD CONSTRAINT `fk_instrumento_estado` FOREIGN KEY (`id_estado`) REFERENCES `estados` (`id_estado`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_instrumento_tipo` FOREIGN KEY (`id_tipo_instrumento`) REFERENCES `tipos_instrumento` (`id_tipo_instrumento`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_instrumento_unidad` FOREIGN KEY (`id_unidad`) REFERENCES `unidades` (`id_unidad`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_instrumento_usuario` FOREIGN KEY (`id_usuario_creador`) REFERENCES `usuarios` (`id_usuario`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `instrumentos_relaciones`
--
ALTER TABLE `instrumentos_relaciones`
  ADD CONSTRAINT `fk_relacion_destino` FOREIGN KEY (`id_instrumento_destino`) REFERENCES `instrumentos` (`id_instrumento`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_relacion_origen` FOREIGN KEY (`id_instrumento_origen`) REFERENCES `instrumentos` (`id_instrumento`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD CONSTRAINT `fk_notificacion_instrumento` FOREIGN KEY (`id_instrumento`) REFERENCES `instrumentos` (`id_instrumento`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_notificacion_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `observaciones`
--
ALTER TABLE `observaciones`
  ADD CONSTRAINT `fk_observacion_estado_instrumento` FOREIGN KEY (`id_estado_instrumento`) REFERENCES `estados` (`id_estado`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_observacion_instrumento` FOREIGN KEY (`id_instrumento`) REFERENCES `instrumentos` (`id_instrumento`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_observacion_resolvio` FOREIGN KEY (`id_usuario_resolvio`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_observacion_respondio` FOREIGN KEY (`id_usuario_respondio`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_observacion_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `partes`
--
ALTER TABLE `partes`
  ADD CONSTRAINT `fk_parte_institucion` FOREIGN KEY (`id_institucion`) REFERENCES `instituciones` (`id_institucion`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_parte_instrumento` FOREIGN KEY (`id_instrumento`) REFERENCES `instrumentos` (`id_instrumento`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_parte_representante` FOREIGN KEY (`id_persona_representante`) REFERENCES `personas` (`id_persona`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `participaciones_personas`
--
ALTER TABLE `participaciones_personas`
  ADD CONSTRAINT `fk_participacion_instrumento` FOREIGN KEY (`id_instrumento`) REFERENCES `instrumentos` (`id_instrumento`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_participacion_persona` FOREIGN KEY (`id_persona`) REFERENCES `personas` (`id_persona`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `pasantias`
--
ALTER TABLE `pasantias`
  ADD CONSTRAINT `fk_pasantia_estudiante` FOREIGN KEY (`id_persona_estudiante`) REFERENCES `personas` (`id_persona`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_pasantia_institucion` FOREIGN KEY (`id_institucion_receptora`) REFERENCES `instituciones` (`id_institucion`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_pasantia_instrumento` FOREIGN KEY (`id_instrumento`) REFERENCES `instrumentos` (`id_instrumento`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_pasantia_responsable` FOREIGN KEY (`id_persona_responsable_receptor`) REFERENCES `personas` (`id_persona`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_pasantia_tutor` FOREIGN KEY (`id_persona_tutor`) REFERENCES `personas` (`id_persona`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `personas`
--
ALTER TABLE `personas`
  ADD CONSTRAINT `fk_persona_institucion` FOREIGN KEY (`id_institucion`) REFERENCES `instituciones` (`id_institucion`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `unidades`
--
ALTER TABLE `unidades`
  ADD CONSTRAINT `fk_unidad_padre` FOREIGN KEY (`id_unidad_padre`) REFERENCES `unidades` (`id_unidad`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_usuario_unidad` FOREIGN KEY (`id_unidad`) REFERENCES `unidades` (`id_unidad`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
