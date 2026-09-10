const fs = require('fs');
let file = fs.readFileSync('src/cores/live/components/Modules/ManualBookSuite.tsx', 'utf8');

// The end of `ten` in `en` currently looks like:
/*
    }
  }
    }
  }
};
*/
// It should be:
/*
      }
    }
  }
};
*/

file = file.replace(/    \}\n  \}\n    \}\n  \}\n\};\n/, '      }\n    }\n  }\n};\n');
fs.writeFileSync('src/cores/live/components/Modules/ManualBookSuite.tsx', file);
