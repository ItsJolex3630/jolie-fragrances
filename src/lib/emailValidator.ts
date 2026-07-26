/**
 * Disposable email domain blocker
 * Prevents registration with temporary/throwaway email services
 */

const DISPOSABLE_DOMAINS = new Set([
  "tempmail.com", "throwaway.email", "guerrillamail.com", "guerrillamailblock.com",
  "grr.la", "guerrillamail.de", "guerrillamail.info", "guerrillamail.net",
  "guerrillamail.org", "guerrillamail.biz", "spam4.me", "sharklasers.com",
  "guerrillamailblock.com", "grr.la", "dispostable.com", "mailnator.com",
  "mailinator.com", "mailcatch.com", "mailexpire.com", "mailmoat.com",
  "mailnull.com", "mailshell.com", "mailzilla.com", "nomail.xl.cx",
  "throwam.com", "trashmail.ws", "tempail.com", "tempr.email",
  "yopmail.com", "yopmail.fr", "yopmail.net", "jetable.org",
  "mailforspam.com", "safetymail.info", "filzmail.com", "incognitomail.org",
  "mailblocks.com", "mailme.lv", "receiveee.com", "tmail.ws",
  "trashymail.com", "tmpmail.net", "tmpmail.org", "10minutemail.com",
  "10minutemail.net", "mailscrap.com", "mailinater.com", "messagebeamer.de",
  "objectmail.com", "proxymail.eu", "rcpt.at", "spamavert.com",
  "uggsrock.com", "mailtemp.info", "mailzilla.org", "meltmail.com",
  "mintemail.com", "mobi.web.id", "moncourrier.fr.nf", "monemail.fr.nf",
  "monmail.fr.nf", "mytemp.email", "mytempemail.com", "no-spam.ws",
  "nobuma.com", "odontel.com", "oneoffemail.com", "opayq.com",
  "ordinaryamerican.net", "ownmail.net", "phenomemail.com", "pjjkp.com",
  "politikerclub.de", "poofy.org", "privatdemail.net", "qq.my",
  "rcpt.at", "realtyalerts.info", "recode.me", "regbypass.com",
  "rmqkr.net", "royal.net", "s0ny.net", "safersignup.de",
  "safetypost.de", "saynotospams.com", "scbox.one", "schafmail.de",
  "selfdestructingmail.com", "sendspamhere.com", "sharklasers.com",
  "shiftmail.com", "shitmail.me", "shortmail.net", "simpleemail.info",
  "sinnlos-mail.de", "slipry.net", "smashmail.de", "snakemail.com",
  "sofimail.com", "solvemail.info", "spamavert.com", "spambob.net",
  "spambog.ru", "spamcannon.com", "spamcero.com", "spamcorptastic.com",
  "spamcowboy.com", "spamday.com", "spamfree24.org", "spamgourmet.com",
  "spamherelots.com", "spamhole.com", "spamify.com", "spaml.de",
  "spammotel.com", "spamobox.com", "spotcurve.com", "squizzy.de",
  "sry.li", "stop-my-spam.com", "stuffmail.de", "supermailer.jp",
  "supergreatmail.com", "supermailer.jp", "superrito.com", "superstachel.de",
  "tafmail.com", "techemail.com", "teleworm.com", "teleworm.us",
  "tempemail.co.za", "tempmail.com", "tempmail.de", "tempmail2.com",
  "tempmaildemo.com", "tempmailer.com", "tempmailer.de", "tempomail.fr",
  "temporaryemail.net", "temporarymail.com", "tempthe.net", "tempymail.com",
  "thc.st", "thelimestones.com", "thismail.net", "throwawaymail.com",
  "throwawaymail.pp.ua", "tilien.com", "tmail.ws", "toiea.com",
  "tradermail.info", "trash-mail.at", "trash-mail.com", "trash2009.com",
  "trashemail.de", "trashmail.at", "trashmail.com", "trashmail.de",
  "trashmail.io", "trashmail.me", "trashmail.net", "trashmail.org",
  "trashmail.ws", "trashmailer.com", "trashymail.com", "trickmail.net",
  "ubismail.net", "uggsrock.com", "uhhu.ru", "upliftnow.com",
  "uplipht.com", "venompen.com", "veryrealemail.com", "vidchart.com",
  "viewcastmedia.com", "vipmail.name", "vipmail.org", "vipso.de",
  "viralplays.com", "vpn.st", "wasteland.rfc822.org", "webemail.me",
  "wegwerfmail.de", "wegwerfmail.net", "wegwerfmail.org", "wh4f.org",
  "whyspam.me", "willhackforfood.biz", "winemaven.info", "wmail.club",
  "wolfsmail.tk", "writeme.us", "wronghead.com", "wuzup.net",
  "wuzupmail.net", "www.e4ward.com", "xagloo.co", "xemaps.com",
  "xents.com", "xmaily.com", "xoxy.net", "xyzfree.net",
  "yapped.net", "yeah.net", "yep.it", "yopmail.com",
  "yopmail.fr", "yopmail.net", "you-spam.com", "youmail.ga",
  "youmailr.com", "yxzx.net", "z1p.biz", "za.com",
  "zaktouni.fr", "zebins.com", "zebins.eu", "zehnminuten.de",
  "zeta-telecom.com", "zippymail.info", "zoaxe.com", "zoemail.org",
  "zomg.info",
]);

/**
 * Check if an email domain is disposable/temporary
 */
export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return true;
  return DISPOSABLE_DOMAINS.has(domain);
}

/**
 * Validate that an email is a real Gmail address
 * Returns { valid: boolean, reason?: string }
 */
export function validateGmail(email: string): { valid: boolean; reason?: string } {
  if (!email || typeof email !== "string") {
    return { valid: false, reason: "Correo electrónico requerido" };
  }

  const trimmed = email.trim().toLowerCase();

  if (!trimmed.includes("@")) {
    return { valid: false, reason: "Formato de correo inválido" };
  }

  const [local, domain] = trimmed.split("@");

  if (!local || local.length < 3) {
    return { valid: false, reason: "El nombre de usuario es muy corto" };
  }

  // Only allow gmail.com
  if (domain !== "gmail.com") {
    return { valid: false, reason: "Solo se permiten correos @gmail.com" };
  }

  // Block disposable emails (extra safety)
  if (isDisposableEmail(trimmed)) {
    return { valid: false, reason: "Correos temporales no permitidos" };
  }

  // Gmail basic format validation
  if (/[^a-z0-9.]/.test(local)) {
    return { valid: false, reason: "Formato de Gmail inválido" };
  }

  if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) {
    return { valid: false, reason: "Formato de Gmail inválido" };
  }

  return { valid: true };
}
