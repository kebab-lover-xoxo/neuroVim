# Overview

## Sprint 0 Remove Before Flight
Docker Run's as root, If express has vulnerability that allows command execution, the attacker has root inside said container giving them the ability to traverse the tree.

Mount Permissions In S0-10 Has unrestricted read and write over all data. Provides host path escapes

### Solutions:
Add non root user to the Dockerfile in S0-02, Add acceptance criterion to SO-02 whoami returns mnemo.
Set Explicit Ownership at build time ensure S0-10 ls -la shows proper owner.

