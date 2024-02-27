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

- `Bidirecional`: simétrica (confidencialidade) ou assimétrica (autenticação e confidencialidade); 
- `Unidirecional`: para autenticação e integridade;

## Criptographic Keys

Uma chave é um conjunto de dados necessários para operações criptográficas, na sua maioria secreta, difícl de memorizar e produzida matematicamente / com recurso a algoritmos. Podem ser chaves:

- `Pessoais`: para autenticação, como as public-keys, com baixa eficiência e longa longevidade;
- `De sessão`: para confidencialidade nos canais de comunicação, como as chaves partilhadas, com alta eficiência e baixa longevidade;

### Digital Certificate

Documento que mapeia uma entidade a uma chave pública. Este documento é assinado por uma entidade confiável (*CA - Certificate Authority*) comum aos endpoints que poderão estar em comunicação.

## Protections

### Secure Channels

Canal de comunicação criptograficamente segura entre duas entidades, permitindo:

- `Authentication`: para uma comunicação genuína;
- `Integrity`: qualquer alteração dos dados trocados é detectada;
- `Confidentiality`: os dados são entendidos apenas pelos destinatários;

Chaves simétricas com longa duração são complexas e pouco seguras de manter ou trocar. Por outro lado, operações com chaves assimétricas são computacionalmente pouco eficientes. Assim, a solução mais usada é uma mistura das duas abordagens:

- A partilha da chave simétrica é feita a partir de chaves assimétricas;
- Depois da troca, as mensagens e documentos são cifrados com recurso à chave simétrica;

Cifras simétricas não impedem a repudiação, pelo que se usam `MAC/MIC` (*Message Authentication or Integrity Code*):

- É um hash resultante da concatenação da mensagem original com uma chave secreta;
- Envia para o destinatário o hash e também a mensagem;
- O receptor verifica a integridade da mensagem, usando a própria chave;

Uma forma mais segura é usar o `HMAC` (*Hashed Messafge Authentication Code*), que usa a parte esquerda e direita da chave em separado, que pode ser menos eficiente em contrapartida.

### Digital Signatures

Next class