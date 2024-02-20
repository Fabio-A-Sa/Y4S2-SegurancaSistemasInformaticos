# Lab 1 - Race Condition

A race condition occurs when multiple processes access and manipulate the same data concurrently, and the outcome of the execution depends on the particular order in which the access takes place.

## Turning Off Countermeasures

To turn off race condition protections, in order to guarantee that the attack will be possible. In Ubuntu 20.04:

```bash
$ sudo sysctl -w fs.protected_symlinks=0
$ sudo sysctl fs.protected_regular=0
```

## Writing a vulnerable program

```c


```

And compile/run it:

```bash

```