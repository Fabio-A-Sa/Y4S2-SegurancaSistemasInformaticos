# Cryptography

**Cryptographers** tentam proteger e restringir os métodos de acesso, enquanto os **cryptanalystis** tentam quebrar esses métodos para validar a segurança do sistema.

## Classification of cryptographic systems

### On the secret

Através de secrets, que podem ser:

- `Secret algorithm`: em aplicações fechadas (militares, comerciais), não recomendadas segundo a literatura porque uma vez descoberto o algoritmo não há muito a fazer;
- `Secret keys`: usadas em todo o lado, recomendadas pela literatura porque qualquer erro é só trocar a(s) chave(s);

Em termos de Secret Keys, podem ser:

- `Simétricas`: eficientes, para grandes quantidades de dados, no entanto combinar chaves iguais em vários endpoints pode tornar-se um problema, pelo que é recomendada em sistemas fechados;
- `Assimétricas`: necessitam de uma computação pesada, não adequada para grandes quantidades de dados, troca simples de chaves públicas, pelo que é seguro utilizá-lo em ambientes abertos;

### On the method

Usadas para longos conjuntos de texto, que são processados em bloco:

- `Streaming`: cada bloco é (de)cifrado segundo um conjunto de chaves diferentes, como o RC4 ou OTP. É difícil armazenar e proteger esta quantidade de chaves;
- `Block`: 
    - `Pure`: cada bloco é (de)cifrado com a mesma chave, como o AES, RSA, SHA-2, SHA-3;
    - `Mixed`: cada bloco é (de)cifrado com uma chave virtual, que é composta de uma chave original mais um incremento diferente por bloco;

### On the purpose

