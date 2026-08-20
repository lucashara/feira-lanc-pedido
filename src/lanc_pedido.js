let isSubmitting = false; // Variável para evitar reenvios múltiplos
let cnpjTimer; // Temporizador para o CNPJ

// Função para adicionar máscara de CNPJ
function mascaraCNPJ(value) {
  return value
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .slice(0, 18); // Limitar a 18 caracteres incluindo a máscara
}

// Função para remover máscara de CNPJ
function removerMascaraCNPJ(value) {
  return value.replace(/\D/g, "");
}

// Função para formatar valor como moeda real
function formatarMoeda(value) {
  value = value.replace(/\D/g, "");
  value = (value / 100).toFixed(2) + "";
  value = value.replace(".", ",");
  value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
  return value;
}

// Função para remover formatação de moeda
function removerFormatacaoMoeda(value) {
  return value.replace(/[^\d,]/g, "").replace(",", ".");
}

// Função para mostrar animação de carregamento
function mostrarCarregamento() {
  const cliente = document.getElementById("cliente");
  const cidade = document.getElementById("cidade");
  const uf = document.getElementById("uf");

  if (cliente && cidade && uf) {
    cliente.value = "Carregando...";
    cidade.value = "Carregando...";
    uf.value = "Carregando...";

    cliente.classList.add("loading");
    cidade.classList.add("loading");
    uf.classList.add("loading");
  }
}

// Função para ocultar animação de carregamento
function ocultarCarregamento() {
  const cliente = document.getElementById("cliente");
  const cidade = document.getElementById("cidade");
  const uf = document.getElementById("uf");

  if (cliente && cidade && uf) {
    cliente.value = "";
    cidade.value = "";
    uf.value = "";

    cliente.classList.remove("loading");
    cidade.classList.remove("loading");
    uf.classList.remove("loading");
  }
}

// Verificar se o token está presente e redirecionar para a página de login se não estiver
const accessToken = localStorage.getItem("accessToken");
if (!accessToken) {
  window.location.href = "./index.html";
}

// Recuperar o nome do usuário e atualizar o título
const userName = localStorage.getItem("userName");
if (userName) {
  document.getElementById(
    "tituloBemVindo"
  ).textContent = `Bem-vindo, ${userName}`;
}

// Lógica para logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userName");
  window.location.href = "./index.html";
});

document.getElementById("cnpj").addEventListener("input", function () {
  this.value = mascaraCNPJ(this.value);
  const cnpjSemMascara = removerMascaraCNPJ(this.value);

  clearTimeout(cnpjTimer); // Limpar o temporizador anterior
  if (cnpjSemMascara.length === 14) {
    cnpjTimer = setTimeout(() => {
      mostrarCarregamento();
      fetch(
        `https://api.grupobrf1.com:10000/consultarclienteporcnpj?cnpj=${cnpjSemMascara}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Não autorizado");
          }
          return response.json();
        })
        .then((data) => {
          ocultarCarregamento();
          // Verifique novamente o comprimento do CNPJ após a resposta da API
          const cnpjInput = document.getElementById("cnpj");
          const cnpjSemMascaraAtual = removerMascaraCNPJ(cnpjInput.value);

          if (
            cnpjSemMascaraAtual.length === 14 &&
            Array.isArray(data) &&
            data.length > 0
          ) {
            const resultado = data[0];
            document.getElementById("cliente").value = resultado.cliente || "";
            document.getElementById("cidade").value = resultado.cidade || "";
            document.getElementById("uf").value = resultado.uf || "";
            const cnpjErrorAlert = document.getElementById("cnpjErrorAlert");
            if (cnpjErrorAlert) {
              cnpjErrorAlert.classList.add("d-none");
            }
            // Habilitar os campos preenchidos
            document.getElementById("cliente").readOnly = true;
            document.getElementById("cidade").readOnly = true;
            document.getElementById("uf").readOnly = true;
          } else {
            // Limpar os campos se o CNPJ não tiver 14 dígitos
            document.getElementById("cliente").value = "";
            document.getElementById("cidade").value = "";
            document.getElementById("uf").value = "";
            document.getElementById("cliente").readOnly = true;
            document.getElementById("cidade").readOnly = true;
            document.getElementById("uf").readOnly = true;
            mostrarAlertaErro(
              "CNPJ não encontrado ou inválido. Tente novamente."
            );
          }
        })

        .catch((error) => {
          console.error("Erro ao buscar dados:", error);
          mostrarAlertaErro("CNPJ não encontrado. Tente novamente.");
          ocultarCarregamento();
        });
    }, 500); // Atraso de 500ms após o término da digitação
  } else {
    // Limpar os campos se o CNPJ não tiver 14 dígitos
    document.getElementById("cliente").value = "";
    document.getElementById("cidade").value = "";
    document.getElementById("uf").value = "";
    document.getElementById("cliente").readOnly = true;
    document.getElementById("cidade").readOnly = true;
    document.getElementById("uf").readOnly = true;
    ocultarCarregamento();
  }
});

document.getElementById("valorped").addEventListener("input", function () {
  this.value = formatarMoeda(this.value);
  validarQtMoedas(); // Revalidar qtmoedas ao alterar valorped
  validarValorPedido(); // Validar valor do pedido ao alterar
});

document.getElementById("qtmoedas").addEventListener("input", function () {
  validarQtMoedas();
});

function validarQtMoedas() {
  const valorpedInput = document.getElementById("valorped");
  const qtmoedasInput = document.getElementById("qtmoedas");
  const qtmoedasError = document.getElementById("qtmoedasError");
  const submitButton = document.querySelector('button[type="submit"]');

  const valorped = parseFloat(
    removerFormatacaoMoeda(valorpedInput.value).replace(",", ".")
  );
  const qtmoedas = parseFloat(qtmoedasInput.value);

  if (!isNaN(valorped) && !isNaN(qtmoedas)) {
    const maxMoedas = Math.floor(valorped * 0.3);

    if (qtmoedas > maxMoedas) {
      qtmoedasInput.classList.add("is-invalid");
      qtmoedasError.classList.remove("d-none");
      qtmoedasError.textContent = `Quantidade de moedas não pode ser maior que 30% do valor do pedido. Máximo permitido: ${maxMoedas}`;
      qtmoedasInput.classList.add("shake");
      setTimeout(() => {
        qtmoedasInput.classList.remove("shake");
      }, 500);
      submitButton.disabled = true;
    } else {
      qtmoedasInput.classList.remove("is-invalid");
      qtmoedasError.classList.add("d-none");
      submitButton.disabled = false;
    }
  } else {
    submitButton.disabled = false;
  }
}

function validarValorPedido() {
  const valorpedInput = document.getElementById("valorped");
  const valorpedError = document.getElementById("valorpedError");
  const submitButton = document.querySelector('button[type="submit"]');

  const valorped = parseFloat(
    removerFormatacaoMoeda(valorpedInput.value).replace(",", ".")
  );

  if (!isNaN(valorped)) {
    const minValorPedido = 1000.0;
    const maxValorPedido = 2000000.0;

    if (valorped < minValorPedido || valorped > maxValorPedido) {
      valorpedInput.classList.add("is-invalid");
      valorpedError.classList.remove("d-none");
      valorpedError.textContent = `O valor do pedido não pode ser menor que 1.000,00 ou maior que 2.000.000,00.`;
      valorpedInput.classList.add("shake");
      setTimeout(() => {
        valorpedInput.classList.remove("shake");
      }, 500);
      submitButton.disabled = true;
    } else {
      valorpedInput.classList.remove("is-invalid");
      valorpedError.classList.add("d-none");
      submitButton.disabled = false;
    }
  } else {
    submitButton.disabled = false;
  }
}

document
  .getElementById("meuFormulario")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    if (isSubmitting) {
      return; // Evitar reenvio se já estiver enviando
    }

    // Verificar se o CNPJ tem exatamente 14 dígitos
    const cnpjInput = document.getElementById("cnpj");
    const cnpjSemMascara = removerMascaraCNPJ(cnpjInput.value);
    if (cnpjSemMascara.length !== 14) {
      cnpjInput.classList.add("is-invalid");
      document.querySelector('.invalid-feedback[for="cnpj"]').textContent =
        "O CNPJ deve ter exatamente 14 dígitos.";
      return;
    }

    // Verificar se qtmoedas é maior que 15% do valorped antes de permitir o envio
    const valorpedInput = document.getElementById("valorped");
    const qtmoedasInput = document.getElementById("qtmoedas");
    const valorped = parseFloat(
      removerFormatacaoMoeda(valorpedInput.value).replace(",", ".")
    );
    const qtmoedas = parseFloat(qtmoedasInput.value);
    const maxMoedas = Math.floor(valorped * 0.15);
    const minValorPedido = 1000.0;

    if (qtmoedas > maxMoedas) {
      qtmoedasInput.classList.add("is-invalid");
      document.getElementById("qtmoedasError").classList.remove("d-none");
      document.getElementById(
        "qtmoedasError"
      ).textContent = `Quantidade de moedas não pode ser maior que 15% do valor do pedido. Máximo permitido: ${maxMoedas}`;
      qtmoedasInput.classList.add("shake");
      setTimeout(() => {
        qtmoedasInput.classList.remove("shake");
      }, 500);
      return;
    }

    if (valorped < minValorPedido) {
      valorpedInput.classList.add("is-invalid");
      document.getElementById("valorpedError").classList.remove("d-none");
      document.getElementById(
        "valorpedError"
      ).textContent = `O valor do pedido não pode ser menor que 1.000,00. Valor mínimo permitido: 1.000,00`;
      valorpedInput.classList.add("shake");
      setTimeout(() => {
        valorpedInput.classList.remove("shake");
      }, 500);
      return;
    }

    isSubmitting = true;

    // Resetar alertas e classes de erro
    document.getElementById("pedidoErrorAlert").classList.add("d-none");
    document.getElementById("pedidoSuccessAlert").classList.add("d-none");
    document.querySelectorAll(".form-control").forEach((input) => {
      input.classList.remove("is-invalid");
    });

    const formData = new FormData(this);

    // Verifique se os dados estão carregados
    if (
      document.getElementById("cliente").value === "Carregando..." ||
      document.getElementById("cidade").value === "Carregando..." ||
      document.getElementById("uf").value === "Carregando..."
    ) {
      mostrarAlertaErro(
        "Aguarde o carregamento dos dados antes de enviar o formulário."
      );
      isSubmitting = false;
      return;
    }

    // Remove máscara do CNPJ e formatação de valor antes de enviar
    formData.set("cnpj", cnpjSemMascara);
    const valorSemFormatacao = removerFormatacaoMoeda(formData.get("valorped"));
    formData.set("valorped", valorSemFormatacao);

    // Exibir modal de confirmação com os dados preenchidos
    document.getElementById("confirmaCnpj").textContent = mascaraCNPJ(
      formData.get("cnpj")
    );
    document.getElementById("confirmaCliente").textContent =
      document.getElementById("cliente").value;
    document.getElementById("confirmaCidade").textContent =
      document.getElementById("cidade").value;
    document.getElementById("confirmaUf").textContent =
      document.getElementById("uf").value;
    document.getElementById("confirmaValorPedido").textContent = formatarMoeda(
      formData.get("valorped")
    );
    document.getElementById("confirmaQtMoedas").textContent =
      formData.get("qtmoedas");
    document.getElementById("confirmaFornecedor").textContent =
      formData.get("fornecedor");
    document.getElementById("confirmaFilial").textContent =
      formData.get("filial");

    // Ajuste para exibir os dados corretamente no modo escuro
    const isDarkMode = document.body.classList.contains("dark-mode");
    document.querySelectorAll("#confirmacaoModal span").forEach((span) => {
      span.style.color = isDarkMode ? "white" : "black";
    });

    const confirmacaoModal = new bootstrap.Modal(
      document.getElementById("confirmacaoModal")
    );
    confirmacaoModal.show();

    // Adicionar evento ao botão de confirmar no modal
    document.getElementById("confirmarPedidoBtn").onclick = function () {
      confirmacaoModal.hide();

      const dadosFormulario = {};
      for (const [key, value] of formData.entries()) {
        dadosFormulario[key] = value;
      }

      // Log dos dados enviados para a API
      console.log(
        "Dados enviados para a API:",
        JSON.stringify(dadosFormulario)
      );

      fetch("https://api.grupobrf1.com:10000/lancarpedido", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(dadosFormulario),
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((data) => {
              throw new Error(data.detail || "Erro na resposta da API");
            });
          }
          return response.json();
        })
        .then((data) => {
          console.log("Resposta da API:", data);
          if (data.detail) {
            mostrarAlertaErro(data.detail);
          } else if (data.mensagem) {
            mostrarAlertaSucesso(data.mensagem);
          } else {
            mostrarAlertaSucesso("Pedido lançado com sucesso!");
          }
          // Limpar os campos do formulário
          document.getElementById("meuFormulario").reset();
          isSubmitting = false;
        })
        .catch((error) => {
          console.error("Erro ao enviar dados:", error.message);
          mostrarAlertaErro(
            "Erro ao enviar dados. Por favor, tente novamente."
          );

          isSubmitting = false;
        });
    };

    // Adicionar evento ao botão de cancelar no modal
    document.getElementById("cancelarPedidoBtn").onclick = function () {
      isSubmitting = false;
    };
  });

function mostrarAlertaErro(mensagem) {
  const alertElement = document.getElementById("pedidoErrorAlert");
  if (alertElement) {
    alertElement.textContent = mensagem;
    alertElement.classList.remove("d-none");
    setTimeout(() => {
      alertElement.classList.add("d-none");
    }, 3000); // Ocultar o alerta após 3 segundos
  }
}

function mostrarAlertaSucesso(mensagem) {
  const alertElement = document.getElementById("pedidoSuccessAlert");
  if (alertElement) {
    alertElement.textContent = mensagem;
    alertElement.classList.remove("d-none");
    setTimeout(() => {
      alertElement.classList.add("d-none");
    }, 3000); // Ocultar o alerta após 3 segundos
  }
}
