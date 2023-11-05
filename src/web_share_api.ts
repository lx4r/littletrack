// TODO: Moving this to a separate file from the rest of the sharing functionality seemed necessary for mocking. Is there a better way?
export function shareMessage(title: string, text: string) {
  if (!navigator.share) {
    throw new Error("Web Share API not supported");
  }

  return navigator.share({
    title,
    text,
  });
}

export function isSharingAvailable() {
  return Boolean(navigator.share);
}
