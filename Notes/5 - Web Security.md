# Web Security

O HTTP protocol é stateless, mas pode ser modificado usando cookies, para autenticação, por exemplo. No entanto fica sensível a:

- Session Hijaking;
- DNS cache poisoning;
- Malicious addresses;

Para melhorar a segurança, podemos usar:

- `PIV`: Personal Identity Verification, usando smartcards;
- `SSO`: single-sign-on, para autenticações federadas;
- `OAuth`: para authorization actors;
- `OpenID`: extensão do OAuth para direct user identification;
- `JWT`: Tokens com assinaturas;
- `JWE`: JWT com encriptação;
- `PoP Tokens`;

