# Software Security

O design da aplicação deve ter em atenção o `threat model`, assim como mecanismos de segurança e *security design principles*. Os mecanismos de segurança são métodos para forçar a policy, que é uma descrição do que é permitido e proibido. Podem ainda conter mecanismos para prevenir, detectar, responder e recuperar de ataques de segurança. Alguns exemplos:

- Authentication
- Access Control
- Data Confidentiality
- Data Integrity
- Non-repudiation

### Security Services

- `Specific`: encriptação, assinaturas digitais, controlo de acessos;
- `Pervasive`: security label, security audit trail, security recovery;

#### Threat Modeling

Com 5 passos essenciais:

- Vision
- Diagram
- Identify Threats
- Mitigate
- Validate

A identificação de threats podem ser através da metodologia `STRIDE`. Para cada entrada identificar como os adversários podem atingir os assrts, e para cada asset a proteger, prever o que os adversários podem fazer (os seus objectivos, no fundo).

