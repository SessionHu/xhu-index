interface SiteGroup {
    id: string,
    name: string,
    links: Sitebox[]
}

interface Sitebox {
    id: string,
    title: string,
    titlecn: string,
    url: string,
    icon: string,
    desc: string,
}

async function fillGroupInfo(): Promise<void> {
    const ctt: HTMLDivElement = document.querySelector("div.content") as HTMLDivElement;
    const gpres: SiteGroup[] = await (await fetch("/assets/sites.json")).json();
    for(const gp of gpres){
        // div.gp
        const gpe: HTMLDivElement = document.createElement("div");
        gpe.className = "gp";
        // div.gptitle & hr
        gpe.insertAdjacentHTML("beforeend",`
            <div class="gptitle" id="${gp.id}">
                <h2>${gp.name}</h2>
            </div>
            <hr />
        `);
        // div.gpframe
        const gpframe: HTMLDivElement = document.createElement("div");
        gpframe.className = "gpframe";
        for(const sitebox of gp.links) {
            gpframe.insertAdjacentHTML("beforeend",`
                <!--${sitebox.title}-->
                <div class="sitebox" id="${sitebox.id}">
                    <a class="siteboxlink" title="${sitebox.title}" href="${sitebox.url}">
                        <div class="siteboxframe">
                            <div class="siteboxheader">
                                <div class="siteicon">
                                    <img alt=" " src="${sitebox.icon}" />
                                </div>
                                <div class="sitetitle">
                                    <span>${sitebox.titlecn}</span>
                                </div>
                            </div>
                            <div class="sitedescription">
                                <span>${sitebox.desc}</span>
                            </div>
                        </div>
                    </a>
                </div>
            `);
        }
        gpe.insertAdjacentElement("beforeend",gpframe);
        ctt.insertAdjacentElement("beforeend",gpe);
    }
}

fillGroupInfo();
