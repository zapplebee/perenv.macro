# perenv.macro.js

A Babel macro to conditionally import something based on environmental variables.

## Why is this a macro?

Why is this a macro? This prevents the import from ever being part of the application code if the environmental variable is not set at build time

This prevents things like mocks, development settings, whatever... from ever getting into built application code.

This was specifically created for msw but has a lot of other applications.
