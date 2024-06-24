import {Button, Heading} from "@navikt/ds-react";
import {PlusIcon} from "@navikt/aksel-icons";


const News = () => {

    return(
        <main className="show-menu">
          <div className="page__background-container">
                 <Heading level="1" size="large" spacing>
                   Nyheter
                 </Heading>
              <Button
                  variant="secondary"
                  size="medium"
                  icon={<PlusIcon aria-hidden />}
                  iconPosition="left"
              >
                  Opprett ny nyhetsmelding
              </Button>


          </div>
        </main>
    )
}

export default News