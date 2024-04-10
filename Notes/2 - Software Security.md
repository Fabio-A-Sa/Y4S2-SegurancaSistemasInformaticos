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

### Threat Modeling

Com 5 passos essenciais:

- Vision
- Diagram
- Identify Threats
- Mitigate
- Validate

A identificação de threats podem ser através da metodologia `STRIDE`: Spoofing, Tampering, Repudiation, Information disclosure, Denial of Service, Elevation of privilege.

#### Identify Threads

Para cada entrada identificar como os adversários podem atingir os assrts, e para cada asset a proteger, prever o que os adversários podem fazer (os seus objectivos, no fundo).

#### Mitigate

É o principal ponto do threat modeling. Podemos, no limite, aceitar a vulnerabilidade no design da aplicação, pois pode ser low-risk ou custo de suporte muito elevado para a complexidade dos assets a assegurar.

### Cryptography

Atualmente é baseada na teoria matemática e assume que os computadores ainda não são suficientemente capazes para quebrar rapidamente determinadas cifras. A library mais conhecida é o OpenSSL. 

- Weak collision resistant: brute force with 2^L;
- Collision resistant: brute force with 2^(L/2);

## Software quality versus Security

Nas bases de dados do MITRE é possível ver a documentação dos ataques. Os mais comuns:

- Memory corruption, without knowing the principle of least privilege or deserialização/serialization objects;
- Input injection without checking, normalization or sanitization;
- Concurrency, race conditions;
- Access control;
- Web application vulnerabilities, XSS, CSRF;
- Poor cryptograpy;

