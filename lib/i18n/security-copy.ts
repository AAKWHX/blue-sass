import { isLocale } from "./config";
const copy = {
  ar: ["حاول مرة أخرى بعد قليل.", "استخدم كلمة مرور من 12 إلى 64 حرفًا، وبحجم لا يتجاوز 72 بايت.", "ظهرت كلمة المرور هذه في تسريب سابق. اختر كلمة مختلفة.", "تعذر التحقق من أمان كلمة المرور الآن. حاول لاحقًا."],
  en: ["Please try again shortly.", "Use 12–64 characters, no more than 72 UTF-8 bytes.", "This password appeared in a data breach. Choose a different password.", "Password security verification is unavailable. Please try again later."],
  nl: ["Probeer het straks opnieuw.", "Gebruik 12–64 tekens, maximaal 72 UTF-8-bytes.", "Dit wachtwoord komt voor in een datalek. Kies een ander wachtwoord.", "Wachtwoordcontrole is tijdelijk niet beschikbaar. Probeer het later opnieuw."],
  de: ["Bitte versuchen Sie es später erneut.", "Verwenden Sie 12–64 Zeichen und höchstens 72 UTF-8-Bytes.", "Dieses Passwort wurde bei einem Datenleck bekannt. Wählen Sie ein anderes.", "Die Passwortprüfung ist derzeit nicht verfügbar. Versuchen Sie es später erneut."],
  tr: ["Lütfen biraz sonra tekrar deneyin.", "12–64 karakter ve en fazla 72 UTF-8 baytı kullanın.", "Bu parola bir veri ihlalinde görüldü. Başka bir parola seçin.", "Parola güvenlik kontrolü şu anda kullanılamıyor. Daha sonra deneyin."],
  fr: ["Veuillez réessayer dans un instant.", "Utilisez 12 à 64 caractères, au maximum 72 octets UTF-8.", "Ce mot de passe figure dans une fuite de données. Choisissez-en un autre.", "La vérification du mot de passe est indisponible. Réessayez plus tard."],
  es: ["Inténtalo de nuevo en unos momentos.", "Usa entre 12 y 64 caracteres y un máximo de 72 bytes UTF-8.", "Esta contraseña apareció en una filtración. Elige otra.", "La comprobación de seguridad no está disponible. Inténtalo más tarde."],
  it: ["Riprova tra poco.", "Usa 12–64 caratteri, al massimo 72 byte UTF-8.", "Questa password è presente in una fuga di dati. Scegline un’altra.", "La verifica della password non è disponibile. Riprova più tardi."],
  pt: ["Tente novamente dentro de instantes.", "Use 12–64 caracteres, no máximo 72 bytes UTF-8.", "Esta palavra-passe apareceu numa fuga de dados. Escolha outra.", "A verificação da palavra-passe está indisponível. Tente mais tarde."],
  pl: ["Spróbuj ponownie za chwilę.", "Użyj 12–64 znaków, maksymalnie 72 bajtów UTF-8.", "To hasło ujawniono w wycieku danych. Wybierz inne.", "Sprawdzanie hasła jest niedostępne. Spróbuj później."],
  uk: ["Спробуйте ще раз трохи пізніше.", "Використовуйте 12–64 символи, не більше 72 байтів UTF-8.", "Цей пароль потрапив у витік даних. Оберіть інший.", "Перевірка пароля недоступна. Спробуйте пізніше."],
  ru: ["Повторите попытку немного позже.", "Используйте 12–64 символа, не более 72 байтов UTF-8.", "Этот пароль обнаружен в утечке данных. Выберите другой.", "Проверка пароля недоступна. Повторите попытку позже."],
  zh: ["请稍后重试。", "请使用12–64个字符，且不超过72个UTF-8字节。", "此密码曾出现在数据泄露中，请更换密码。", "暂时无法检查密码安全性，请稍后重试。"],
  ja: ["しばらくしてから再試行してください。", "12～64文字、UTF-8で72バイト以内にしてください。", "このパスワードは漏えいが確認されています。別のものを選んでください。", "パスワードの安全性を確認できません。後ほど再試行してください。"],
  ko: ["잠시 후 다시 시도해 주세요.", "12~64자, UTF-8 기준 최대 72바이트를 사용하세요.", "유출된 적이 있는 비밀번호입니다. 다른 비밀번호를 선택하세요.", "비밀번호 보안 확인을 사용할 수 없습니다. 나중에 다시 시도해 주세요."],
};
export function securityCopy(locale: string) {
  const [retry, length, breached, unavailable] = copy[isLocale(locale) ? locale : "en"];
  return { retry, length, breached, unavailable };
}
