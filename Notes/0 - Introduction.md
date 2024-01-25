# Introduction

A Segurança Informática é importante para proteger **ativos** (recursos, informações, hardware/software). Para isso, é necessário haver um **controlo de acessos**, bem como definição de **entidades** (participante, pessoa física, sistema operativo, processo ou tarefa) responsáveis e que podem aceder aos recursos. Os principais objectivos são permitir:

- `Confidentiality`: conhecimento da informação só por parte das entidades permitidas, através de encoding-decoding, com criptografia;
- `Integrity`: só determinadas entidades têm permissões de alterar o recurso, através do cálculo do MIC/MAC (*Message Authentication Code*) e verificação do mesmo nos endpoints;
- `Availability`: a informação deve estar acessível / disponível às entidades, através de uma confirmação por via de um challenge custoso, para evitar ataques DDoS;
- `Authenticity`: pode pedir autenticação para provar a identificação da entidade;

## Threats and Attacks classification

**Threat** é o risco ou possibilidade da ocorrência de um eventual problema de segurança no futuro. Já o **attack** ou ocorrência e concretização da threat, normalmente de forma deliberada. Podem ser classificados em diversos tipos:

- `Intenção`: nenhuma, através de erros de hardware, ou de propósito;
- `Origem`: internal, external;
- `Operation mode`: passiva, através de inferência ou leitura de documentos expostos, activa quando se trata de vírus, por exemplo;
- `Predictability`: normal, como malícia humana ou bugs de software, dificultada, como danos no hardware;
- `Severidade`: normal, como obstrução de meios de comunicação, ou catastrófica, destruição por tsunamis;

## Proteção

Necessita de:

- Definição de uma **security policy**, ou seja, quem pode fazer o quê, quando e onde;
- Definição de **security mechanisms**, para garantir o cumprimento da security policy, como ciphering, access control and logging / monitoring;

