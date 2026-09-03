/* Terra Drilling — interattivita del sito (menu, wizard preventivo, invio email) */
(function () {
  "use strict";
  var GAS_URL = "https://script.google.com/macros/s/AKfycbzlzXluHeJ8znVEBMmBh9lYYVqp1jxGJFY4HWvKc_wNlcKx10G6W2sWevc9spHMddZD/exec";

  /* ---------- HEADER: responsive, scroll, menu mobile ---------- */
  function header() {
    var hd = document.querySelector("header");
    if (!hd) return;
    var overlay = /rgba\(10, ?22, ?36/.test(hd.getAttribute("style") || "");
    var row = hd.firstElementChild;
    if (!row) return;
    var logo = row.querySelector("a"),
        nav = row.querySelector("nav"),
        cta = row.querySelector(":scope > div"),
        burger = row.querySelector('button[aria-label="Menu"]'),
        panel = hd.querySelector(":scope > div:nth-of-type(2)"),
        dock = hd.nextElementSibling && hd.nextElementSibling.tagName === "DIV" ? hd.nextElementSibling : null;
    var bars = burger ? burger.querySelectorAll("span") : [];
    var open = false;

    function line(dark, extra) {
      return "display:block;height:2px;border-radius:2px;background:" + (dark ? "#fff" : "#14202B") +
        ";transition:transform .3s,opacity .3s;" + (extra || "");
    }
    function apply() {
      var mobile = window.innerWidth < 940,
          scrolled = window.scrollY > 60,
          dark = overlay && !scrolled;
      if (!mobile) open = false;
      hd.style.background = dark ? "rgba(10,22,36,.18)" : "rgba(245,243,239,.94)";
      hd.style.borderBottom = "1px solid " + (dark ? "rgba(255,255,255,.14)" : "#E2DED6");
      if (logo) logo.style.background = dark ? "rgba(255,255,255,.94)" : "transparent";
      if (nav) {
        nav.style.display = mobile ? "none" : "flex";
        Array.prototype.forEach.call(nav.querySelectorAll("a"), function (a) {
          a.style.color = dark ? "#fff" : "#14202B";
        });
      }
      if (cta) {
        cta.style.display = mobile ? "none" : "flex";
        cta.style.color = dark ? "#fff" : "#14202B";
      }
      if (burger) {
        burger.style.display = mobile ? "flex" : "none";
        burger.style.borderColor = dark ? "rgba(255,255,255,.4)" : "#D9D4CA";
        burger.style.background = dark ? "rgba(255,255,255,.1)" : "#fff";
        if (bars.length === 3) {
          bars[0].setAttribute("style", line(dark, open ? "transform:translateY(8px) rotate(45deg)" : ""));
          bars[1].setAttribute("style", line(dark, open ? "opacity:0" : ""));
          bars[2].setAttribute("style", line(dark, open ? "transform:translateY(-8px) rotate(-45deg)" : ""));
        }
      }
      if (panel) panel.style.display = mobile && open ? "flex" : "none";
      if (dock) dock.style.display = mobile ? "flex" : "none";
    }
    if (burger) burger.addEventListener("click", function () { open = !open; apply(); });
    window.addEventListener("resize", apply);
    window.addEventListener("scroll", apply, { passive: true });
    apply();
  }

  /* ---------- WIZARD PREVENTIVO + invio reale ---------- */
  function wizard() {
    var byText = function (root, t) {
      return Array.prototype.filter.call(root.querySelectorAll("button"), function (b) {
        return b.textContent.trim() === t;
      });
    };
    var steps = Array.prototype.filter.call(document.querySelectorAll("div"), function (d) {
      var s = d.getAttribute("style") || "";
      return /^display: ?(block|none)/.test(s) && d.querySelector("h2, label, button");
    });
    var sName = document.querySelector('input[placeholder="Mario Rossi"]');
    if (!sName) return; // non e la pagina contatti
    var step1 = null, step2 = null, step3 = null, step4 = null;
    steps.forEach(function (d) {
      if (d.querySelector('input[placeholder="Mario Rossi"]')) step3 = step3 || d;
      else if (d.querySelector('input[placeholder="Es. Pescara, Via Aterno 12"]')) step2 = step2 || d;
      else if (byText(d, "Richiesta inviata").length || /Richiesta inviata/.test(d.textContent)) step4 = step4 || d;
    });
    var conts = byText(document, "Continua →");
    if (conts.length) {
      var c0 = conts[0];
      var p = c0.parentElement;
      while (p && p !== document.body && !/^display: ?(block|none)/.test(p.getAttribute("style") || "")) p = p.parentElement;
      if (p && p !== document.body) step1 = p;
    }
    if (!step1 || !step2 || !step3 || !step4) return;

    var head = step1.parentElement.querySelector(":scope > div");
    function show(n) {
      step1.style.display = n === 1 ? "block" : "none";
      step2.style.display = n === 2 ? "block" : "none";
      step3.style.display = n === 3 ? "block" : "none";
      step4.style.display = n === 4 ? "block" : "none";
      window.scrollTo({ top: step1.parentElement.getBoundingClientRect().top + window.scrollY - 110, behavior: "smooth" });
    }

    /* pill selezionabili */
    function pills(scope, multi) {
      var els = Array.prototype.filter.call(scope.querySelectorAll("div"), function (d) {
        return /user-select: ?none/.test(d.getAttribute("style") || "");
      });
      els.forEach(function (el) {
        el.addEventListener("click", function () {
          if (multi) el.dataset.on = el.dataset.on === "1" ? "" : "1";
          else els.forEach(function (o) { o.dataset.on = o === el ? "1" : ""; });
          els.forEach(function (o) {
            var on = o.dataset.on === "1";
            o.style.borderColor = on ? "#C8A23C" : "#DDD8CE";
            o.style.background = on ? "#FBF3DF" : "#FAF9F6";
          });
        });
      });
      return els;
    }
    var servPills = pills(step1, true), timePills = pills(step2, false);
    var picked = function (els) {
      return els.filter(function (e) { return e.dataset.on === "1"; })
                .map(function (e) { return e.textContent.trim(); }).join(", ");
    };

    byText(step1, "Continua →").forEach(function (b) { b.addEventListener("click", function () { show(2); }); });
    byText(step2, "← INDIETRO").forEach(function (b) { b.addEventListener("click", function () { show(1); }); });
    byText(step2, "Continua →").forEach(function (b) { b.addEventListener("click", function () { show(3); }); });
    byText(step3, "← INDIETRO").forEach(function (b) { b.addEventListener("click", function () { show(2); }); });
    byText(step4, "← NUOVA RICHIESTA").forEach(function (b) {
      b.addEventListener("click", function () {
        step3.querySelectorAll("input").forEach(function (i) { i.type === "checkbox" ? (i.checked = false) : (i.value = ""); });
        show(1);
      });
    });

    var send = byText(step3, "Invia richiesta →")[0];
    if (!send) return;
    send.addEventListener("click", function () {
      var nome = (step3.querySelector('input[placeholder="Mario Rossi"]') || {}).value || "";
      var tel = (step3.querySelector('input[placeholder="335 1234567"]') || {}).value || "";
      var mail = (step3.querySelector('input[type="email"]') || {}).value || "";
      var priv = step3.querySelector('input[type="checkbox"]');
      var luogo = (step2.querySelector('input[placeholder="Es. Pescara, Via Aterno 12"]') || {}).value || "";
      var tipo = (step2.querySelector("select") || {}).value || "";
      if (!nome.trim() || !mail.trim()) { alert("Inserisci almeno nome ed email."); return; }
      if (priv && !priv.checked) { alert("Per proseguire devi accettare l'informativa privacy."); return; }
      var ref = "TDT-" + Math.random().toString(36).slice(2, 7).toUpperCase();
      var orig = send.textContent;
      send.textContent = "Invio in corso…"; send.disabled = true;
      var payload = {
        tipo: "preventivo", rif: ref, nome: nome, email: mail, telefono: tel,
        messaggio: "RICHIESTA PREVENTIVO DAL SITO\nRiferimento: " + ref +
          "\nServizi richiesti: " + (picked(servPills) || "-") +
          "\nLuogo del cantiere: " + (luogo || "-") +
          "\nTipo di intervento: " + (tipo || "-") +
          "\nTempistica: " + (picked(timePills) || "-")
      };
      fetch(GAS_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) })
        .catch(function () {})
        .then(function () {
          var r = step4.querySelector("strong"); if (r) r.textContent = ref;
          send.textContent = orig; send.disabled = false;
          if (head) head.style.display = "none";
          show(4);
        });
    });
  }

  function init() { header(); wizard(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
