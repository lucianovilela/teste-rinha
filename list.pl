#!/usr/bin/perl
use strict;
use warnings;
use File::Find;

my $dir = './rinha-de-backend-2024-q1/participantes'; # diretório para começar a busca
my $pattern = 'github.com\/[\w\-_]+\/[\w\-_]+'; # expressão regular para procurar nos arquivos

find(\&wanted, $dir);

sub wanted {
    return unless -f; # retorna se o item não for um arquivo
    return unless $_ eq 'README.md'; # retorna se o arquivo não for README.md

    open my $fh, '<', $File::Find::name or die "Não foi possível abrir '$_': $!";
    while (<$fh>) {
        if (/$pattern/) {
            print "A expressão '$pattern' foi encontrada em $File::Find::name\n";
            last;
        }
    }
    close $fh;
}
