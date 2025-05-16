export const parseUrl = (s: string) => {
  let urlString = s;
  if (!urlString.startsWith("http")) {
    urlString = "https://" + urlString;
  }
  try {
    return new URL(urlString);
  } catch {
    return false;
  }
};

//Ingen sikkerhet at dette kun ligger i frontend. For brukerinfo er det ok men sikkerheten må ligge i backend
export const validateDomain = (url: URL) => {
  const validDomains = ["www.youtube.com", "youtube.com", "www.vimeo.com", "vimeo.com", "youtu.be"];
  return validDomains.some((d) => d === url.hostname);
};

export const validateUrl = (url: string) => {
  const parsedUrl = parseUrl(url);
  if (parsedUrl) {
    const isValidDomain = validateDomain(new URL(parsedUrl));
    if (!isValidDomain) {
      return "Kun lenker fra YouTube og Vimeo er tillatt";
    }
  } else {
    return "Ugyldig lenke. Eksempel på gyldig url er https://www.youtube.com/en-produkt-video";
  }

  return "";
};
