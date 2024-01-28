# Introduction

A Segurança Informática é importante para proteger **ativos** (recursos, informações, hardware/software). Para isso, é necessário haver um **controlo de acessos**, bem como definição de **entidades** (participante, pessoa física, sistema operativo, processo ou tarefa) responsáveis e que podem aceder aos recursos. Os principais objectivos são permitir:

- `Confidentiality`: conhecimento da informação só por parte das entidades permitidas, através de encoding-decoding, com criptografia;
- `Integrity`: só determinadas entidades têm permissões de alterar o recurso, através do cálculo do MIC/MAC (*Message Authentication Code*) e verificação do mesmo nos endpoints;
- `Availability`: a informação deve estar acessível / disponível às entidades, através de uma confirmação por via de um challenge custoso, para evitar ataques DDoS;
- `Authenticity`: pode pedir autenticação para provar a identificação da entidade;

