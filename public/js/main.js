const transformarJSaPHP = () => {
  const entradaJS = document.getElementById("codigoJS");
  const salidaPHP = document.getElementById("codigoPHP");
  const temaSeleccionado = document.getElementById("temaSelect").value;

  const codigoJavaScript = entradaJS.value.trim();

  if (!codigoJavaScript) {
    Swal.fire({
      title: "Campo vacío",
      text: "Por favor, ingresa el código JavaScript.",
      icon: "warning",
      confirmButtonText: "Aceptar",
    });
    return;
  }
  if (temaSeleccionado === "") {
    Swal.fire({
      title: "Tema no seleccionado",
      text: "Por favor, selecciona un tema.",
      icon: "warning",
      confirmButtonText: "Aceptar",
    });
    return;
  }

  try {
    let codigoPHP = codigoJavaScript;

    switch (temaSeleccionado) {
      case "variables":
        codigoPHP = codigoJavaScript.replace(
          /\b(let|const|var)\s+(\w+)/g,
          "$$$2;"
        );
        codigoPHP = "<?php\n" + codigoPHP + "\n?>";
        break;

      case "funciones":
        codigoPHP = codigoPHP.replace(/(const|let|var)\s+/g, "");
        codigoPHP = codigoPHP.replace(
          /function\s+(\w+)?\s*\((.*?)\)\s*{/g,
          (_, funcName, params) => {
            const phpParams = params
              .split(",")
              .map((param) => param.trim())
              .filter((param) => param)
              .map((param) => "$" + param)
              .join(", ");
            return `function ${funcName || ""}(${phpParams}) {`;
          }
        );
        codigoPHP = codigoPHP.replace(
          /(\w+)?\s*=\s*\((.*?)\)\s*=>\s*{([^}]+)}/g,
          (_, funcName, params, body) => {
            const phpParams = params
              .split(",")
              .map((param) => param.trim())
              .filter((param) => param)
              .map((param) => "$" + param)
              .join(", ");
            return `function ${funcName || ""}(${phpParams}) {\n${body}\n}`;
          }
        );
        codigoPHP = codigoPHP.replace(
          /(\w+)?\s*=\s*\((.*?)\)\s*=>\s*(.+);/g,
          (_, funcName, params, returnValue) => {
            const phpParams = params
              .split(",")
              .map((param) => param.trim())
              .filter((param) => param)
              .map((param) => "$" + param)
              .join(", ");
            return `function ${
              funcName || ""
            }(${phpParams}) {\nreturn ${returnValue.replace(
              /(\b\w+\b)/g,
              (match) => (match.startsWith("$") ? match : "$" + match)
            )};\n}`;
          }
        );
        codigoPHP = codigoPHP.replace(/return\s+(.*?);/g, (_, returnValue) => {
          return `return ${returnValue.replace(/(\b\w+\b)/g, (match) =>
            match.startsWith("$") ? match : "$" + match
          )};`;
        });
        codigoPHP = codigoPHP.replace(
          /(\w+)\s*=\s*function\s*\((.*?)\)\s*{/g,
          (_, funcName, params) => {
            const phpParams = params
              .split(",")
              .map((param) => param.trim())
              .filter((param) => param)
              .map((param) => "$" + param)
              .join(", ");
            return `function ${funcName}(${phpParams}) {`;
          }
        );
        codigoPHP = codigoPHP.replace(
          /(\w+)\s*=\s*function\s*\((.*?)\)\s*=>\s*(.+);/g,
          (_, funcName, params, body) => {
            const phpParams = params
              .split(",")
              .map((param) => param.trim())
              .filter((param) => param)
              .map((param) => "$" + param)
              .join(", ");
            return `function ${funcName}(${phpParams}) {\nreturn ${body.replace(
              /(\b\w+\b)/g,
              (match) => (match.startsWith("$") ? match : "$" + match)
            )};\n}`;
          }
        );
        codigoPHP = codigoPHP.replace(/console\.log\s*\((.*?)\);/g, "echo $1;");
        codigoPHP = "<?php\n" + codigoPHP + "\n?>";
        break;

      case "estructurasControl":
        codigoPHP = codigoJavaScript
          .split("\n")
          .map((linea) => {
            if (linea.match(/\b(let|const|var)\s+\w+/)) {
              return linea.replace(/\b(let|const|var)\s+(\w+)/g, "$$$2");
            }
            return linea;
          })
          .join("\n");
        codigoPHP = codigoPHP
          .split("\n")
          .map((linea) => {
            if (
              linea.trim().startsWith("if") &&
              linea.match(/\bif\s*\(.*\)\s*{/)
            ) {
              return linea.replace(/if\s*\((.*?)\)\s*{/, (match, condition) => {
                const phpCondition = condition.replace(
                  /\b(\w+)\b/g,
                  (match, varName) => (isNaN(varName) ? "$" + varName : varName)
                );
                return `if (${phpCondition}) {`;
              });
            } else if (
              linea.trim().startsWith("else if") &&
              linea.match(/\belse\s*if\s*\(.*\)\s*{/)
            ) {
              return linea.replace(
                /else if\s*\((.*?)\)\s*{/,
                (match, condition) => {
                  const phpCondition = condition.replace(
                    /\b(\w+)\b/g,
                    (match, varName) =>
                      isNaN(varName) ? "$" + varName : varName
                  );
                  return `elseif (${phpCondition}) {`;
                }
              );
            } else if (
              linea.trim().startsWith("else") &&
              linea.match(/\belse\s*{/)
            ) {
              return linea.replace(/else\s*{/, "else {");
            } else if (linea.trim().startsWith("while")) {
              return linea.replace(
                /while\s*\(([^)]+)\)\s*{/,
                (match, condition) => {
                  const conditionWithDollar = condition.replace(
                    /\b(\w+)\b/g,
                    (match, varName) =>
                      isNaN(varName) ? "$" + varName : varName
                  );
                  return `while (${conditionWithDollar}) {`;
                }
              );
            } else if (linea.trim().startsWith("for")) {
              return linea.replace(
                /for\s*\(([^)]+)\)\s*{/,
                (match, condition) => {
                  const conditionWithDollar = condition.replace(
                    /\b(\w+)\b/g,
                    (match, varName) =>
                      isNaN(varName) ? "$" + varName : varName
                  );
                  return `for (${conditionWithDollar}) {`;
                }
              );
            } else if (linea.trim().startsWith("console.log")) {
              return linea.replace(/console\.log\s*\((.*?)\);/, "echo $1;");
            }
            linea = linea.replace(/" \+ /g, '" . ');
            return linea.replace(
              /([^$a-zA-Z0-9_])(\w+)/g,
              (match, prefix, varName) => {
                if (prefix.trim() === "") return match;
                return prefix + "$" + varName;
              }
            );
          })
          .join("\n");
        codigoPHP = "<?php\n" + codigoPHP + "\n?>";
        break;

      case "arrays":
        codigoPHP = codigoPHP.replace(
          /\b(?:let|const|var)\s+(\w+)\s*=\s*\[(.*?)\];/g,
          (match, nombreArray, contenidoArray) => {
            const phpArray = contenidoArray
              .split(",")
              .map((elemento) => {
                const contenidoLimpo = elemento.trim();
                if (contenidoLimpo.match(/^['"].*['"]$/)) {
                  return contenidoLimpo;
                } else {
                  return "$" + contenidoLimpo;
                }
              })
              .join(", ");
            return `$${nombreArray} = array(${phpArray});\nprint_r($${nombreArray});`;
          }
        );
        break;

      case "clasesYObjetos":
        codigoPHP = codigoJavaScript.replace(
          /class\s+(\w+)\s*{/g,
          "class $1 {"
        );
        codigoPHP = codigoPHP.replace(
          /constructor\s*\((.*?)\)\s*{/g,
          "public function __construct($1) {"
        );
        codigoPHP = codigoPHP.replace(
          /public function __construct\((.*?)\) {/g,
          (match, params) => {
            const phpParams = params
              .split(",")
              .map((param) => {
                return param.trim().startsWith("$")
                  ? param.trim()
                  : "$" + param.trim();
              })
              .join(", ");
            return `public function __construct(${phpParams}) {`;
          }
        );
        codigoPHP = codigoPHP.replace(
          /this\.(\w+)\s*=\s*(.*?);/g,
          "$this->$1 = $2;"
        );
        codigoPHP = codigoPHP.replace(
          /(\w+)\s*\(\)\s*{/g,
          "public function $1() {"
        );
        codigoPHP = codigoPHP.replace(/`(.*?)`/g, '"$1"');

        codigoPHP = codigoPHP.replace(/this\.(\w+)/g, "$this->$1");

        codigoPHP = codigoPHP.replace(
          /const\s+(\w+)\s*=\s*new\s+(\w+)\s*\((.*?)\);/g,
          "$$1 = new $2($3);"
        );

        codigoPHP = codigoPHP.replace(/(\w+)\.(\w+)\(\);/g, "$$1->$2();");

        codigoPHP = "<?php\n" + codigoPHP + "\n?>";
        break;

      default:
        throw new Error("Tema no reconocido");
    }

    codigoPHP = codigoPHP.replace(/console\.log\s*\((.*?)\);/g, "echo $1;");

    salidaPHP.value = codigoPHP;
  } catch (error) {
    Swal.fire({
      title: "Error",
      text: error.message,
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  }
};

const limpiarCampos = () => {
  document.getElementById("codigoJS").value = "";
  document.getElementById("codigoPHP").value = "";
  document.getElementById("temaSelect").selectedIndex = 0;
};

const copiarAlPortapapeles = () => {
  const salidaPHP = document.getElementById("codigoPHP");
  salidaPHP.select();
  document.execCommand("copy");
  Swal.fire({
    title: "Copiado",
    text: "El código PHP ha sido copiado al portapapeles.",
    icon: "success",
    confirmButtonText: "Aceptar",
  });
};
