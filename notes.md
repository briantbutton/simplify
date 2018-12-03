# Notes

Even for this simple exercise, it was better to perform simplification after converting to JavaScript models.  I thought there would be three steps: conversion-in, simplification and conversion-out.  When I started writing the models, all the functionality got subsumed there.  Conversion-in reduced to verification.  Conversion-out was really an "export" built into the models.

The simplification rules were ad hoc and not based on any deeper principle.  I inserted them in the code where most convenient.

Improvements:

If one started adding more operators (e.g. not) then the logic would need re-examination and maybe restructuring.  It's really not general-purpose.

The errors could give more helpful information.  That is always useful for a highly re-usable utility.

If this were to get very sophisticated and dynamic, then it might be best to pull the simplifaction rules out, for maintainability.  I think there might be a possible "deeper principle", a pattern-based algorithm, for simplification but I didn't research it.
