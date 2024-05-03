# Authorization

Autorização, também conhecida como Resource Access Control. Podem haver vários tipos de controlo de acessos:

- `Discretionary Access Control` (DAC): uma matriz entre recursos e entidades;
- `Mandatory Access Control` (MAC): para cada recurso, uma lista de pessoas permitidas, de acordo com labels de segurança: MLS (*Multi-level security*);
- `Role Based Access Control` (RBAC): a partir do role das pessoas, com uma associação many-to-many com roles, a partir de recursos e entidades;
- `Attribute Based Access Control` (ABAC): as autorizações são condições em propriedades de objectos e recursos;