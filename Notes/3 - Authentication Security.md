# Authentication Security

As entidades num sistema têm identidades com respectivos acessos. Na maioria das organizações usa-se o pattern `PDP-PEP`, que possui estes passos:

- `PEP` - Policy enforcement point;
- `PDP` - Policy decision point;
- `PIP` - Policy information persistence;
- `PAP` - Policy administration point;

Authentication é aliar uma entidade a uma identidade, usando segurança. Existe o processo de registo, identificação, verificação. Esta autenticação pode ser por:

- `Password`, hash code with salt, por causa dos rainbow attacks;
- `Token based`, smartcards, with challenge, OTP (one-time passwords, using age-policy);
- `Electronic identity`, como os cartões de cidadão;
- `Biometric`, leitura de impressões digitais, veias ou íris;
- `Multifactor`, com um conjunto de operações, em vez de uma;

### Authentication Security Issues

- Client attacks;
- Host attacks;
- Eavesdropping;
- Replay;
- Trojan horse;
- Denial of Service;