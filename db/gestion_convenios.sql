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
(1, 3, 'crear', 'instrumentos', 1, '{"codigo":"ADENDA-2026-001","titulo":"Adenda para trazabilidad y calidad de datos académicos","estado_inicial":"borrador"}', '127.0.0.1', '2026-11-18 10:00:00', '2026-11-18 10:00:00'),
(2, 4, 'cambiar_estado', 'instrumentos', 1, '{"estado_anterior":"borrador","estado_nuevo":"revision","fundamento":"La adenda quedó completa y se remite a revisión administrativa."}', '127.0.0.1', '2026-11-18 10:01:00', '2026-11-18 10:01:00'),
(3, 3, 'crear', 'instrumentos', 2, '{"codigo":"ESP-2026-002","titulo":"Convenio específico para intercambio de datos agronómicos","estado_inicial":"borrador"}', '127.0.0.1', '2026-11-18 10:05:00', '2026-11-18 10:05:00'),
(4, 4, 'cambiar_estado', 'instrumentos', 2, '{"estado_anterior":"revision","estado_nuevo":"aprobado","fundamento":"Se verificó el plan de trabajo y el resguardo de datos."}', '127.0.0.1', '2026-11-18 10:07:00', '2026-11-18 10:07:00'),
(5, 3, 'crear', 'instrumentos', 3, '{"codigo":"PAS-2026-003","titulo":"Convenio de pasantía en pruebas y documentación de software","estado_inicial":"borrador"}', '127.0.0.1', '2026-11-18 10:10:00', '2026-11-18 10:10:00'),
(6, 3, 'crear', 'instrumentos', 4, '{"codigo":"MARCO-2026-004","titulo":"Convenio marco de cooperación en desarrollo de software académico","estado_inicial":"borrador"}', '127.0.0.1', '2026-11-18 10:15:00', '2026-11-18 10:15:00'),
(7, 4, 'cambiar_estado', 'instrumentos', 4, '{"estado_anterior":"revision","estado_nuevo":"aprobado","fundamento":"El convenio marco fue revisado y aprobado para firma."}', '127.0.0.1', '2026-11-18 10:17:00', '2026-11-18 10:17:00'),
(8, 4, 'cambiar_estado', 'instrumentos', 4, '{"estado_anterior":"aprobado","estado_nuevo":"firmado","fundamento":"Las partes suscribieron el convenio marco."}', '127.0.0.1', '2026-11-18 10:18:00', '2026-11-18 10:18:00');
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
(1, 1, 1, 2, 3, 'La adenda quedó completa y se remite a revisión administrativa.', '2026-11-18 10:01:00', '2026-11-18 10:01:00'),
(2, 2, 1, 2, 3, 'El convenio específico se envía a revisión administrativa.', '2026-11-18 10:06:00', '2026-11-18 10:06:00'),
(3, 2, 2, 3, 4, 'Se verificó el plan de trabajo, las obligaciones y las cláusulas de resguardo de datos; queda aprobado.', '2026-11-18 10:07:00', '2026-11-18 10:07:00'),
(4, 4, 1, 2, 3, 'El convenio marco completo se remite a revisión administrativa.', '2026-11-18 10:16:00', '2026-11-18 10:16:00'),
(5, 4, 2, 3, 4, 'El convenio marco fue revisado y aprobado para firma.', '2026-11-18 10:17:00', '2026-11-18 10:17:00'),
(6, 4, 3, 4, 4, 'Las partes suscribieron el convenio marco.', '2026-11-18 10:18:00', '2026-11-18 10:18:00');

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
(1, 'Municipalidad de General Pico', 'Gobierno', NULL, 'Domicilio institucional', 'General Pico', 'La Pampa', 'municipalidad.gp.contacto@gmail.com', '2302472183', '2026-11-19 10:00:00', '2026-11-19 10:00:00'),
(2, 'Establecimiento Asistencial Gobernador Centeno', 'Salud', NULL, 'Domicilio institucional', 'General Pico', 'La Pampa', 'gobernador.centeno.gp@gmail.com', '2302531746', '2026-11-19 10:00:00', '2026-11-19 10:00:00'),
(3, 'Polo Científico Tecnológico / Agencia CITIA', 'Tecnología', NULL, 'Domicilio institucional', 'General Pico', 'La Pampa', 'polo.citia.gp@gmail.com', '2302684219', '2026-11-19 10:00:00', '2026-11-19 10:00:00'),
(4, 'CORPICO (Cooperativa Regional de Electricidad)', 'Cooperativa', NULL, 'Domicilio institucional', 'General Pico', 'La Pampa', 'corpico.gp.contacto@gmail.com', '2302395827', '2026-11-19 10:00:00', '2026-11-19 10:00:00'),
(5, 'ISEF (Instituto Superior de Educación Física)', 'Educación', NULL, 'Domicilio institucional', 'General Pico', 'La Pampa', 'isef.gp.contacto@gmail.com', '2302721604', '2026-11-19 10:00:00', '2026-11-19 10:00:00'),
(6, 'Universidad Nacional de La Pampa (UNLPam)', 'Educación', NULL, 'Domicilio institucional', 'General Pico', 'La Pampa', 'unlpam.gp.contacto@gmail.com', '2302458932', '2026-11-19 10:00:00', '2026-11-19 10:00:00');

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
(1, 'ADENDA-2026-001', 'Adenda para trazabilidad y calidad de datos académicos', 4, 6, 2, 'Actualizar el protocolo de intercambio de datos para incorporar controles de trazabilidad y validación de registros.', 'Equipos académicos y técnicos de la Facultad de Ciencias Exactas y Naturales y Administración Central.', 'Las partes documentarán cambios, validarán integridad antes de cada intercambio y designarán referentes técnicos.', 'Cualquiera de las partes podrá rescindir con aviso escrito de 30 días; se completarán las tareas críticas ya iniciadas.', 'Ley 24.521 de Educación Superior, normativa institucional de protección de datos y convenio marco vigente entre las partes.', 'Resolución Rectoral 184/2026', 'EXP-UNLPam-2026-00481', 'Vigencia de la adenda condicionada a la vigencia del convenio base; revisión anual por acuerdo escrito.', 'Los datos personales y académicos se usarán solo para los fines acordados y con acceso limitado a los equipos autorizados.', 'Temática inspirada en modelado, consistencia y trazabilidad de datos del TP integrador. Adenda demostrativa para el proyecto.', NULL, '2026-11-18', '2027-11-18', 30, 1, 3, '2026-11-18 10:00:00', '2026-11-18 10:00:00'),
(2, 'ESP-2026-002', 'Convenio específico para intercambio de datos agronómicos', 2, 3, 3, 'Desarrollar un prototipo para integrar datos de ensayos de cultivos y generar indicadores comparables de rendimiento.', 'Facultad de Agronomía y Administración Central; incluye diseño de esquema, carga controlada y reportes de resultados.', 'La Facultad definirá el diccionario de datos y validará resultados; Administración Central brindará soporte de infraestructura y resguardo.', 'Rescisión con preaviso de 45 días, preservando respaldos y entregables producidos hasta la fecha.', 'Ley 24.521, reglamentos de investigación de la UNLPam y convenio marco institucional de cooperación académica.', 'Resolución Consejo Directivo 092/2026', 'EXP-UNLPam-2026-00512', 'Plazo inicial de 24 meses, prorrogable por acuerdo escrito luego de evaluar resultados y recursos.', 'Los datos de ensayos se publicarán de forma agregada; las bases sin anonimizar no podrán compartirse fuera de los equipos autorizados.', 'Convenio específico demostrativo vinculado con la organización y análisis de datos experimentales.', NULL, '2026-11-18', '2028-11-18', 45, 1, 3, '2026-11-18 10:05:00', '2026-11-18 10:05:00'),
(3, 'PAS-2026-003', 'Convenio de pasantía en pruebas y documentación de software', 3, 2, 1, 'Establecer una pasantía formativa para participar en el aseguramiento de calidad de un sistema de gestión académica.', 'Pasantía de estudiante de Ingeniería en Sistemas en la Facultad de Ingeniería, con tutoría académica y supervisión institucional.', 'La pasante cumplirá el plan formativo y resguardará credenciales; la institución receptora brindará tutor, equipo y seguimiento semanal.', 'Cualquiera de las partes podrá solicitar la finalización anticipada con notificación escrita y cierre de actividades en curso.', 'Ley 26.427 de pasantías educativas, Ley 24.521 y reglamento de pasantías de la UNLPam.', 'Acta de aprobación de plan formativo 2026-117', 'EXP-UNLPam-2026-00539', 'Duración de seis meses; cualquier prórroga requerirá evaluación del tutor y acuerdo escrito previo.', 'El acceso a entornos y datos será limitado al necesario para pruebas; queda prohibida la divulgación de información institucional.', 'Pasantía demostrativa orientada a pruebas funcionales, documentación y mejora incremental de software.', NULL, '2026-11-18', '2027-05-18', 30, 1, 3, '2026-11-18 10:10:00', '2026-11-18 10:10:00'),
(4, 'MARCO-2026-004', 'Convenio marco de cooperación en desarrollo de software académico', 1, 1, 4, 'Establecer un marco de cooperación para diseñar, implementar y mantener soluciones de software que apoyen procesos académicos.', 'Cooperación entre Administración Central y la Facultad de Ciencias Humanas en proyectos de sistemas, capacitación y transferencia de conocimiento.', 'Las partes designarán enlaces, acordarán planes de trabajo específicos, compartirán avances y evaluarán resultados al menos una vez por año.', 'Cualquiera de las partes podrá rescindir mediante notificación fehaciente con 60 días de anticipación, respetando actividades específicas vigentes.', 'Ley 24.521, Estatuto de la UNLPam y normativa institucional aplicable a convenios de cooperación.', 'Resolución Rectoral 201/2026', 'EXP-UNLPam-2026-00577', 'Vigencia de tres años, con renovación por períodos iguales mediante acuerdo escrito y evaluación de las actividades.', 'El material con datos personales o información institucional reservada tendrá acceso restringido y no podrá divulgarse sin autorización.', 'Convenio marco demostrativo para colaboración interdisciplinaria en análisis y desarrollo de sistemas académicos.', '2026-11-18', '2026-11-18', '2029-11-18', 60, 1, 3, '2026-11-18 10:15:00', '2026-11-18 10:15:00');

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
(1, 1, 2, 'modifica', 'La adenda actualiza el convenio específico de intercambio de datos agronómicos mediante nuevos controles de trazabilidad.', '2026-11-18 10:02:00', '2026-11-18 10:02:00');

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
(1, 1, 4, 2, 'Confirmar que los controles de trazabilidad se aplicarán también a los archivos históricos incluidos en los intercambios.', 'pendiente', NULL, NULL, NULL, NULL, NULL, '2026-11-18 10:03:00', '2026-11-18 10:03:00');

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
(1, 1, 6, 'Parte firmante principal', 1, 'Secretario de Ciencia y Técnica', NULL, '2026-11-18 10:00:00', '2026-11-18 10:00:00'),
(2, 1, 3, 'Parte firmante tecnológica', 1, 'Representante institucional', NULL, '2026-11-18 10:00:00', '2026-11-18 10:00:00'),
(3, 2, 6, 'Parte firmante institucional', 1, 'Secretario de Ciencia y Técnica', NULL, '2026-11-18 10:05:00', '2026-11-18 10:05:00'),
(4, 2, 1, 'Parte firmante municipal', 1, 'Representante municipal', NULL, '2026-11-18 10:05:00', '2026-11-18 10:05:00'),
(5, 3, 6, 'Parte firmante institucional', 1, 'Secretario de Coordinación y Planeamiento', NULL, '2026-11-18 10:10:00', '2026-11-18 10:10:00'),
(6, 3, 5, 'Institución receptora', 1, 'Representante académico', NULL, '2026-11-18 10:10:00', '2026-11-18 10:10:00'),
(7, 4, 6, 'Parte firmante institucional', 1, 'Rector/a', '2026-11-18', '2026-11-18 10:15:00', '2026-11-18 10:18:00'),
(8, 4, 4, 'Parte firmante cooperativa', 1, 'Representante institucional', '2026-11-18', '2026-11-18 10:15:00', '2026-11-18 10:18:00');

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
(1, 1, 1, 'Referente técnico de datos', '2026-11-18', '2027-11-18', 'Coordina validaciones, control de cambios y trazabilidad de intercambios.', '2026-11-18 10:00:00', '2026-11-18 10:00:00'),
(2, 1, 2, 'Responsable de investigación', '2026-11-18', '2028-11-18', 'Define indicadores y valida los resultados de los ensayos agronómicos.', '2026-11-18 10:05:00', '2026-11-18 10:05:00'),
(3, 1, 3, 'Pasante de desarrollo y QA', '2026-11-18', '2027-05-18', 'Participa en pruebas funcionales y documentación del sistema.', '2026-11-18 10:10:00', '2026-11-18 10:10:00'),
(4, 1, 4, 'Enlace académico', '2026-11-18', '2029-11-18', 'Coordina propuestas interdisciplinarias de software académico.', '2026-11-18 10:15:00', '2026-11-18 10:15:00');

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
(1, 3, 1, 1, 5, 1, 'Ingeniería en Sistemas', '2026-12-01', '2027-05-31', 20, 'Diseño de casos de prueba, ejecución de pruebas funcionales, registro de incidencias y elaboración de documentación técnica.', 'Asignación estímulo mensual según normativa vigente', 'Cobertura de accidentes personales contratada por la institución receptora', 'planificada', '2026-11-18 10:10:00', '2026-11-18 10:10:00');

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
(1, 'Valentina', 'Fernández', '43812490', 'valen.fernandez99@gmail.com', '2302541820', 6, '2026-11-19 10:00:00', '2026-11-19 10:00:00'),
(2, 'Martín', 'Sosa', '36429105', 'martinsosa.gp@gmail.com', '2302418934', 1, '2026-11-19 10:00:00', '2026-11-19 10:00:00'),
(3, 'Camila', 'Pereyra', '45190332', 'cami.pereyra03@gmail.com', '2302627411', 6, '2026-11-19 10:00:00', '2026-11-19 10:00:00'),
(4, 'Lucas', 'Mansilla', '33874612', 'lucas.mansilla88@gmail.com', '2302510948', 2, '2026-11-19 10:00:00', '2026-11-19 10:00:00'),
(5, 'Sofía', 'Rodríguez', '41258740', 'sofia.rodriguez.lp@gmail.com', '2302483329', 6, '2026-11-19 10:00:00', '2026-11-19 10:00:00'),
(6, 'Nicolás', 'Cabrera', '38910244', 'nico.cabrera95@gmail.com', '2302604715', 4, '2026-11-19 10:00:00', '2026-11-19 10:00:00');

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
(1, 'Administración Central', 'administrativa', 'Unidad administrativa central de la UNLPam.', NULL, '2026-11-06 20:21:01', '2026-11-18 10:00:00'),
(2, 'Facultad de Ingeniería', 'académica', 'Unidad académica de General Pico.', NULL, '2026-11-09 16:36:13', '2026-11-18 10:00:00'),
(3, 'Facultad de Agronomía', 'académica', 'Unidad académica con sede en Santa Rosa.', NULL, '2026-11-18 10:00:00', '2026-11-18 10:00:00'),
(4, 'Facultad de Ciencias de la Salud', 'académica', 'Unidad académica con sede en General Pico.', NULL, '2026-11-18 10:00:00', '2026-11-18 10:00:00'),
(5, 'Facultad de Ciencias Económicas y Jurídicas', 'académica', 'Unidad académica con sede en Santa Rosa.', NULL, '2026-11-18 10:00:00', '2026-11-18 10:00:00'),
(6, 'Facultad de Ciencias Exactas y Naturales', 'académica', 'Unidad académica con sede en Santa Rosa.', NULL, '2026-11-18 10:00:00', '2026-11-18 10:00:00'),
(7, 'Facultad de Ciencias Humanas', 'académica', 'Unidad académica con sede en Santa Rosa.', NULL, '2026-11-18 10:00:00', '2026-11-18 10:00:00'),
(8, 'Facultad de Ciencias Veterinarias', 'académica', 'Unidad académica de General Pico.', NULL, '2026-11-18 10:00:00', '2026-11-18 10:00:00');

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
  MODIFY `id_auditoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

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
  MODIFY `id_historial_estado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `instituciones`
--
ALTER TABLE `instituciones`
  MODIFY `id_institucion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `instrumentos`
--
ALTER TABLE `instrumentos`
  MODIFY `id_instrumento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

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
  MODIFY `id_persona` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `tipos_instrumento`
--
ALTER TABLE `tipos_instrumento`
  MODIFY `id_tipo_instrumento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `unidades`
--
ALTER TABLE `unidades`
  MODIFY `id_unidad` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

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
