import footer from '@/reference-pages/shared-footer.json'

/** The same captured WordPress footer is used by collections and service pages. */
export function LiveSiteFooter() {
  return <>
    <style dangerouslySetInnerHTML={{__html: footer.style}} />
    <div dangerouslySetInnerHTML={{__html: footer.html}} />
  </>
}
